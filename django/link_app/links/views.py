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
model_t5 = AutoModelForSeq2SeqLM.from_pretrained(model_dir)
model_sbert = SentenceTransformer('sentence-transformers/xlm-r-100langs-bert-base-nli-stsb-mean-tokens')

max_input_length = 512

def keyword_func(doc, top_n, nr_candidates):
    okt = Okt()
    tokenized_doc = okt.pos(doc)
    tokenized_nouns = ' '.join([word[0] for word in tokenized_doc if word[1] == 'Noun'])
    
    if not tokenized_nouns.strip():
        return ["비어있지롱~"]  # 비어 있는 경우 반환할 단어
    
    n_gram_range = (1, 2)
    count = CountVectorizer(ngram_range=n_gram_range)
    try:
        count.fit([tokenized_nouns])
        candidates = count.get_feature_names_out()
    except ValueError as e:
        logger.error("Error in CountVectorizer: %s", e)
        return ["비어있지롱~"]  # 비어 있는 경우 반환할 단어
    
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
    output = model_t5.generate(**inputs, num_beams=8, max_length=100, length_penalty=2.0, num_return_sequences=1, no_repeat_ngram_size=2)
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

    @action(detail=False, methods=['post'])
    def summarize(self, request):
        input_text = request.data.get('content', '')
        if not input_text:
            return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        keyword_list = keyword_func(input_text, top_n=3, nr_candidates=24)
        summary_result = summarization(input_text)
        return Response({'summary': summary_result, 'keyword': keyword_list})

    @action(detail=False, methods=['post'])
    def extract_from_url(self, request):
        url = request.data.get('url', '')
        if not url:
            return Response({'error': 'URL is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
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
                    'summary': "비어있지롱~",
                    'keywords': ["비어있지롱~"],
                    'image_url': image_url
                })
            
            keyword_list = keyword_func(text_content, top_n=3, nr_candidates=24)
            summary_result = summarization(text_content)

            # 데이터베이스에 저장
            link = Link.objects.create(
                url=url,
                title=title,
                description=summary_result,
                image_url=image_url,
                keywords=keyword_list
            )

            return Response({
                'id': link.id,
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
