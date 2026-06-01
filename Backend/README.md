# PriceMarket Backend

물가를 주식장 UI로 보여주는 웹 서비스의 백엔드 API 서버입니다.

## 기술 스택

- **Spring Boot** 3.2.5
- **Java** 17
- **Spring Web, Spring Data JPA, Spring Validation**
- **MySQL** 8 (운영 DB)
- **H2** (테스트 전용)
- **Lombok**
- **Gradle** (Kotlin DSL)
- **springdoc-openapi** 2.3.0 (Swagger UI)

## 개발 환경 설정

### 외부 API 키 설정

프로젝트 루트(`PriceMarket-Backend/`)에 `.env` 파일을 생성합니다.
`.env.example`을 복사해서 시작하세요:

```bash
cp .env.example .env
```

`.env` 파일에 실제 API 키를 입력합니다:

```env
# 한국석유공사 Opinet — 에너지 종목 실가격 수집
# 발급: https://www.opinet.co.kr/user/main/mainView.do → Open API 신청
OPINET_API_KEY=여기에_발급받은_키_입력

# 한국은행 ECOS (Step 3-2에서 사용)
ECOS_API_KEY=your_ecos_key_here

# 공공데이터포털 (Step 3-3에서 사용)
DATA_GO_KR_KEY=your_data_go_kr_key_here
```

> `.env` 파일은 `.gitignore`에 등록되어 있어 커밋되지 않습니다.

---

## 로컬 실행 방법

### 1. MySQL 설치 및 DB 생성

```bash
brew install mysql
brew services start mysql
```

MySQL에 접속하여 DB와 사용자를 생성합니다:

```sql
CREATE DATABASE pricemarket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pricemarket'@'localhost' IDENTIFIED BY 'pricemarket';
GRANT ALL PRIVILEGES ON pricemarket.* TO 'pricemarket'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 프로젝트 실행

```bash
./gradlew bootRun
```

- **첫 실행 시** 30개 종목(시드 데이터) + 약 54,750개 가격 이력이 자동 삽입됩니다.
- `OPINET_API_KEY`가 설정된 경우 에너지 종목 5개(휘발유·고급휘발유·경유·등유·부탄)의 5년치 실데이터를 Opinet에서 수집합니다 (약 1~3분 소요, API 261회 호출).
- 두 번째 실행부터는 기존 데이터를 유지합니다.

### 3. 테스트 실행

```bash
./gradlew test
```

테스트는 H2 인메모리 DB를 사용하므로 MySQL 없이도 실행됩니다.

## API 문서

서버 실행 후 아래 URL에서 Swagger UI를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

## 주요 API 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/v1/market/summary` | 시장 전체 + 섹터별 요약 |
| GET | `/api/v1/stocks` | 전체 종목 리스트 (페이징, 필터, 정렬) |
| GET | `/api/v1/stocks/top-movers` | 상승/하락 상위 종목 |
| GET | `/api/v1/stocks/search?q=검색어` | 종목명 검색 |
| GET | `/api/v1/stocks/{id}` | 단일 종목 상세 |
| GET | `/api/v1/stocks/{id}/history?period=1M` | 가격 이력 (1W/1M/3M/1Y/5Y/ALL) |
| GET | `/api/v1/sectors/{category}` | 섹터별 종목 + 통계 |
| GET | `/api/v1/admin/external-status` | 외부 API 연동 상태 확인 |

## 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `SPRING_PROFILES_ACTIVE` | 활성 프로파일 | `local` |
| `OPINET_API_KEY` | 한국석유공사 Opinet API 키 | (미설정 시 에너지 실데이터 수집 생략) |
| `ECOS_API_KEY` | 한국은행 ECOS API 키 | (Step 3-2) |
| `DATA_GO_KR_KEY` | 공공데이터포털 디코딩 키 | (Step 3-3) |
| `DB_URL` | DB 연결 URL (prod 전용) | - |
| `DB_USERNAME` | DB 사용자명 (prod 전용) | - |
| `DB_PASSWORD` | DB 비밀번호 (prod 전용) | - |

## 프로파일

- `local` — MySQL 로컬, DDL auto=update, SQL 로깅 ON
- `prod` — 환경변수 기반 DB, DDL auto=validate, SQL 로깅 OFF
- `test` — H2 인메모리, DDL auto=create-drop
