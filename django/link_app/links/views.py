from django.shortcuts import render
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
# Create your views here.
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
    n_gram_range = (1, 2)
    count = CountVectorizer(ngram_range=n_gram_range).fit([tokenized_nouns])
    candidates = count.get_feature_names_out()
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