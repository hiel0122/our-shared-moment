# 기술 노트 (Technical Notes)

## 프로젝트 개요
- **프레임워크**: React 18 + Vite
- **언어**: TypeScript
- **스타일링**: TailwindCSS
- **상태 관리**: TanStack React Query v5
- **백엔드**: Lovable Cloud (Supabase)
- **인증**: Supabase Auth

## 환경 변수

프로젝트는 `.env` 파일을 통해 자동으로 환경 변수가 관리됩니다:

```bash
VITE_SUPABASE_URL=<자동 설정>
VITE_SUPABASE_ANON_KEY=<자동 설정>
VITE_SUPABASE_PROJECT_ID=<자동 설정>
```

**중요**: `.env` 파일은 Lovable Cloud 연동 시 자동 생성되므로 **직접 수정하지 마세요**.

### 추가 환경 변수 (향후 확장)
```bash
# Naver Map API (장소 섹션용)
VITE_NAVER_MAP_CLIENT_ID=<발급받은 클라이언트 ID>

# 결제 연동 (선택사항)
VITE_TOSS_CLIENT_KEY=<TossPayments 클라이언트 키>
VITE_PORTONE_IMP_CODE=<PortOne 가맹점 식별코드>
```

## React Query 설정

### QueryClientProvider 위치
- **파일**: `src/App.tsx`
- **설정**: 전역 QueryClient 인스턴스를 App 컴포넌트에서 생성 및 제공
- **특징**: Vite 프로젝트이므로 별도의 Providers 파일 없이 App.tsx에서 직접 제공

```tsx
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* ... */}
    </TooltipProvider>
  </QueryClientProvider>
);
```

### useQuery 사용 컴포넌트
다음 컴포넌트들이 React Query를 사용합니다:
- `HeroSection.tsx` - invitation 테이블 조회
- `MediaSection.tsx` - media_assets 테이블 조회
- `LocationSection.tsx` - venue 테이블 조회
- `MessageSection.tsx` - messages 테이블 조회 및 mutation
- `FooterSection.tsx` - invitation 테이블 조회

## Supabase 데이터베이스 스키마

### 테이블 구조

#### 1. profiles
```sql
- id: UUID (PK, FK → auth.users)
- role: app_role ('admin' | 'guest')
- display_name: TEXT
- created_at: TIMESTAMPTZ
```

#### 2. invitation
```sql
- id: UUID (PK)
- couple_groom: TEXT (기본: '김철수')
- couple_bride: TEXT (기본: '이영희')
- wedding_at: TIMESTAMPTZ (기본: 2026-12-05 14:00:00+09)
- hero_line1/2/3: TEXT
- created_at/updated_at: TIMESTAMPTZ
```

#### 3. media_assets
```sql
- id: UUID (PK)
- type: media_type ('video' | 'image' | 'text')
- url: TEXT
- content: TEXT
- sort_order: INTEGER
- created_at: TIMESTAMPTZ
```

#### 4. venue
```sql
- id: UUID (PK)
- name: TEXT
- address: TEXT
- lat/lng: NUMERIC
- created_at: TIMESTAMPTZ
```

#### 5. messages
```sql
- id: BIGSERIAL (PK)
- target: message_target ('groom' | 'bride')
- writer: TEXT
- password_hash: TEXT (bcrypt 해싱)
- content: TEXT
- created_at: TIMESTAMPTZ
```

### RLS 정책 요약

- **invitation/media_assets/venue**: 모두가 읽기 가능, 관리자만 수정 가능
- **messages**: 모두가 읽기/작성 가능, 관리자만 삭제 가능
- **profiles**: 모두가 읽기 가능, 본인만 수정 가능

## 인증 시스템

### 기본 관리자 계정
```
이메일: admin@admin.com
비밀번호: 1234
```

### 자동 프로필 생성
- 신규 사용자 가입 시 `handle_new_user()` 트리거가 자동 실행
- `admin@admin.com`으로 가입 시 자동으로 `admin` 역할 부여
- 그 외 사용자는 `guest` 역할

### 인증 플로우
1. `/editor` 로그인 페이지
2. Supabase Auth로 이메일/비밀번호 인증
3. profiles 테이블에서 role 확인
4. admin인 경우 `/editor/dashboard`로 리다이렉트
5. 비관리자는 로그아웃 후 에러 메시지

## 보안 고려사항

### 비밀번호 해싱
- 메시지 보드 비밀번호는 **bcryptjs**로 해싱 후 저장
- 절대 평문 저장 금지
- 삭제 시 비밀번호 검증 필요 (관리자 제외)

### RLS 정책
- 모든 테이블에 Row Level Security 활성화
- 관리자 권한은 profiles.role로 확인
- auth.uid()를 통한 사용자 식별

## Naver Map 연동 (예정)

### 준비사항
1. [Naver Cloud Platform](https://www.ncloud.com/)에서 계정 생성
2. AI·NAVER API > Maps > Web Dynamic Map API 신청
3. 클라이언트 ID 발급 받기
4. 환경 변수에 추가:
   ```bash
   VITE_NAVER_MAP_CLIENT_ID=your_client_id
   ```

### 사용 예시
```tsx
// LocationSection.tsx에 추가
useEffect(() => {
  const script = document.createElement('script');
  script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${import.meta.env.VITE_NAVER_MAP_CLIENT_ID}`;
  script.async = true;
  document.head.appendChild(script);
  
  script.onload = () => {
    // 지도 초기화
  };
}, []);
```

## 결제 연동 (선택사항)

### Option A: TossPayments
- 간편한 위젯 SDK
- 국내 주요 결제수단 지원
- 문서: https://docs.tosspayments.com/

### Option B: PortOne (아임포트)
- 다양한 PG사 연동
- 통합 결제 솔루션
- 문서: https://portone.io/korea/ko/docs

## 배포

### Lovable 배포
1. 우측 상단 **Publish** 버튼 클릭
2. 자동으로 배포 URL 생성
3. 커스텀 도메인 연결 가능 (유료 플랜)

### 커스텀 도메인
- Project > Settings > Domains
- DNS CNAME 레코드 설정 필요
- SSL 인증서 자동 발급

## 성능 최적화

### 이미지 최적화
- 미디어 자산은 Supabase Storage 사용 권장
- lazy loading 적용
- WebP 포맷 사용

### 코드 스플리팅
- React.lazy() + Suspense 활용
- 라우트별 번들 분리

## 문제 해결

### "No QueryClient set" 에러
- App.tsx에서 QueryClientProvider 확인
- useQuery 사용 컴포넌트가 Provider 내부에 있는지 확인

### 빌드 에러
- TypeScript 타입 에러: `@types/*` 패키지 설치
- Supabase 타입: `src/integrations/supabase/types.ts` 자동 생성됨

### 인증 문제
- 관리자 계정 미생성: `/editor`에서 admin@admin.com으로 회원가입
- RLS 정책: Lovable Cloud 백엔드에서 확인
