gpt-oss-20b
개요
이 API 서비스는 OpenAI의 오픈 웨이트(Open Weights) 모델인 gpt-oss-20b를 직접 서빙하는 추론 인터페이스를 제공합니다. 사용자는 이 API를 통해 별도의 프록시 설정 없이 고성능 오픈 소스 모델을 직접 활용할 수 있습니다.

gpt-oss-20b는 2025년 8월 출시된 모델로, 210억 개의 매개변수(3.6B 활성 매개변수)를 가진 MoE(Mixture-of-Experts) 아키텍처를 기반으로 합니다. 이 모델은 낮은 지연 시간(Low Latency)과 로컬 및 특수 목적의 사용 사례에 최적화되어 있으며, 복잡한 추론 및 에이전틱(Agentic) 워크플로우를 강력하게 지원합니다.

API는 표준 Chat Completions 규격을 따르므로 기존 HTTP 클라이언트와 쉽게 통합됩니다.

API 엔드포인트
HTTP

POST https://{API_BASE_URL}/v1/chat/completions
인증
이 API는 Bearer Token 인증 방식을 사용합니다. 요청 헤더에 발급받은 토큰을 포함해야 합니다.

사용법
필수 요건
HTTP 요청을 보내기 위해 requests 라이브러리가 필요합니다.

Bash

pip install requests
예제 코드
Python의 requests 라이브러리를 사용하여 모델에 채팅 완성을 요청하는 기본 예제입니다.

Python

import requests

# API 엔드포인트 및 인증 토큰 설정
# 실제 환경에서는 환경 변수 등을 통해 관리하는 것을 권장합니다.
API_BASE_URL = "api.your-service.com"  # 실제 API 주소로 변경
BEARER_TOKEN = "your-service-api-token" # 발급받은 토큰 입력

url = f"https://{API_BASE_URL}/v1/chat/completions" 
headers = {
    "Authorization": f"Bearer {BEARER_TOKEN}",
    "accept": "application/json",
    "content-type": "application/json"
}

# 요청 페이로드 구성
payload = {
    "model": "openai/gpt-oss-20b",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "남극에는 어떤 동물이 살아?"
        }
    ],
    "max_tokens": 256,
    "temperature": 0.5
}

# POST 요청 전송
response = requests.post(url, headers=headers, json=payload)

# 응답 결과 출력
print(f"Status Code: {response.status_code}")
print(f"Response Body: {response.text}")
지원되는 매개변수
요청 payload에 포함될 수 있는 주요 매개변수는 다음과 같습니다.

매개변수	타입	설명
model	string	"openai/gpt-oss-20b"여야 함
messages	array	메시지 객체 목록
temperature	number	샘플링 온도 (0-2)
max_tokens	integer	응답의 최대 토큰 수
stream	boolean	스트리밍 응답 활성화 여부
response_format	object	구조화된 출력을 위한 JSON 또는 Pydantic 모델
통합 가이드
이 서비스는 OpenAI API 형식을 따르는 HTTP 요청을 처리합니다. 따라서 requests 외에도 curl, Postman 또는 언어별 HTTP 클라이언트를 사용하여 Authorization 헤더와 올바른 JSON 페이로드를 전송하면 모델을 사용할 수 있습니다.

const url = 'https://mlapi.run/074881af-991b-4237-b58a-5e8a39b225f4';
const payload = {PAYLOAD};

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {API_KEY}'
  },
  body: JSON.stringify(payload)
});

console.log(response.text);