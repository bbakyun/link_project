from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Link
from .serializers import LinkSerializer
from keybert import KeyBERT
from konlpy.tag import Okt
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import numpy as np
import nltk
import itertools
from bs4 import BeautifulSoup
import requests
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# nltk punkt tokenizer가 필요한 경우에만 다운로드
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

model_dir = "lcw99/t5-base-korean-text-summary"
tokenizer_t5 = AutoTokenizer.from_pretrained(model_dir)
model_t5 = AutoModelForSeq2SeqLM.from_pretrained(model_dir, device_map="cpu")
model_sbert = SentenceTransformer('sentence-transformers/xlm-r-100langs-bert-base-nli-stsb-mean-tokens')

max_input_length = 512

def keyword_func(doc, top_n, nr_candidates):
    okt = Okt()
    tokenized_doc = okt.pos(doc)
    tokenized_nouns = ' '.join([word[0] for word in tokenized_doc if word[1] == 'Noun'])
    
    if not tokenized_nouns.strip():
        return ["직접 채워주세요"]  
    
    n_gram_range = (1, 2)
    count = CountVectorizer(ngram_range=n_gram_range)
    try:
        count.fit([tokenized_nouns])
        candidates = count.get_feature_names_out()
    except ValueError as e:
        logger.error("Error in CountVectorizer: %s", e)
        return ["직접 채워주세요"]  
    
    doc_embedding = model_sbert.encode([doc])
    candidate_embeddings = model_sbert.encode(candidates)
    distances = cosine_similarity(doc_embedding, candidate_embeddings)
    distances_candidates = cosine_similarity(candidate_embeddings, candidate_embeddings)
    words_idx = list(distances.argsort()[0][-nr_candidates:])
    words_vals = [candidates[index] for index in words_idx]
    distances_candidates = distances_candidates[np.ix_(words_idx, words_idx)]
    min_sim = np.inf
    candidate = None
    for combination in itertools.combinations(range(len(words_idx)), top_n):
        sim = sum([distances_candidates[i][j] for i in combination for j in combination if i != j])
        if sim < min_sim:
            candidate = combination
            min_sim = sim
    blog_keyword = [words_vals[idx] for idx in candidate]
    return blog_keyword

def summarization(text):
    inputs = ["summarize: " + text]
    inputs = tokenizer_t5(inputs, max_length=max_input_length, truncation=True, return_tensors="pt")
    output = model_t5.generate(**inputs, num_beams=2, max_length=100, length_penalty=2.0, num_return_sequences=1, no_repeat_ngram_size=2)
    decoded_output = tokenizer_t5.batch_decode(output, skip_special_tokens=True)[0]
    predicted_title = nltk.sent_tokenize(decoded_output.strip())[0]
    return predicted_title

def get_image_url(soup):
    img = soup.find('img')
    if img and img.get('src'):
        return img['src']
    return None

class LinkViewSet(viewsets.ModelViewSet):
    queryset = Link.objects.all()
    serializer_class = LinkSerializer

    def get_queryset(self):
        user_uuid = self.request.query_params.get('user_uuid')
        if user_uuid:
            return Link.objects.filter(user_uuid=user_uuid)
        return super().get_queryset()

    def create(self, request, *args, **kwargs):
        user_uuid = request.data.get('user_uuid')
        if not user_uuid:
            return Response({'error': 'UUID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        url = request.data.get('url')
        title = request.data.get('title')
        description = request.data.get('description')
        keywords = request.data.get('keywords')
        image_url = request.data.get('image_url')

        try:
            # URL과 사용자 UUID 조합이 이미 있는지 확인
            existing_link = Link.objects.filter(url=url, user_uuid=user_uuid).first()
            if existing_link:
                return Response({
                    'message': 'Link already exists!',
                    'link_id': existing_link.id,
                    'title': existing_link.title,
                    'description': existing_link.description,
                    'keywords': existing_link.keywords,
                    'image_url': existing_link.image_url
                }, status=status.HTTP_200_OK)

            # 새로운 링크 생성
            link = Link.objects.create(url=url, title=title, description=description, keywords=keywords, image_url=image_url, user_uuid=user_uuid)
            link.save()
            return Response({'message': 'Link added successfully!', 'link_id': link.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error("Error adding link: %s", e)
            return Response({'error': 'An error occurred while adding the link.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        try:
            link = self.get_object()
            link.delete()
            return Response({'message': 'Link deleted successfully!'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error("Error deleting link: %s", e)
            return Response({'error': 'An error occurred while deleting the link.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def extract_from_url(self, request):
        url = request.data.get('url', '')
        user_uuid = request.data.get('user_uuid', None)

        # 디버그 로그 추가
        logger.debug(f"Received URL: {url}")
        logger.debug(f"Received UUID: {user_uuid}")

        if not url:
            return Response({'error': 'URL is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not user_uuid:
            return Response({'error': 'User UUID is required'}, status=status.HTTP_400_BAD_REQUEST)

        # 먼저 데이터베이스에서 해당 URL이 있는지 확인
        existing_link = Link.objects.filter(url=url, user_uuid=user_uuid).first()
        if existing_link:
            # 이미 존재하는 링크 데이터를 반환
            return Response({
                'title': existing_link.title,
                'summary': existing_link.description,
                'keywords': existing_link.keywords,
                'image_url': existing_link.image_url
            }, status=status.HTTP_200_OK)

        try:
            # URL에서 콘텐츠를 추출하여 요약 및 키워드 생성
            response = requests.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            title = soup.title.string if soup.title else 'No Title'
            paragraphs = soup.find_all('p')
            text_content = ' '.join([para.get_text() for para in paragraphs])
            image_url = get_image_url(soup)

            if not text_content.strip():
                return Response({
                    'title': title,
                    'summary': "직접 채워주세요",
                    'keywords': ["직접 채워주세요"],
                    'image_url': image_url
                })

            keyword_list = keyword_func(text_content, top_n=3, nr_candidates=24)
            summary_result = summarization(text_content)

            return Response({
                'title': title,
                'summary': summary_result,
                'keywords': keyword_list,
                'image_url': image_url
            })

        except requests.exceptions.RequestException as e:
            logger.error("RequestException: %s", e)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error("Unexpected error: %s", e)
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
