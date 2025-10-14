# 관리자 편집 가이드

## 관리자 계정 생성

처음 사용 시 관리자 계정을 생성해야 합니다:

1. `/editor` 페이지로 이동
2. 다음 정보로 **회원가입** (로그인 아님):
   - 이메일: `admin@admin.com`
   - 비밀번호: `1234`
3. 가입 후 자동으로 관리자 권한이 부여됩니다
4. 이후부터는 동일한 정보로 로그인하면 됩니다

**중요**: 
- 처음 사용 시에는 **반드시 회원가입**을 먼저 해야 합니다
- `admin@admin.com`으로 가입한 계정만 자동으로 관리자 권한을 받습니다
- 이미 가입했다면 로그인만 하면 됩니다

## 현재 구현된 기능

### 1. 로그인/로그아웃
- 경로: `/editor`
- 로그인 성공 시 `/editor/dashboard`로 이동
- 대시보드에서 로그아웃 가능

### 2. 메시지 관리 (수동)
현재는 Lovable Cloud 백엔드에서 직접 관리:
1. 채팅창에서 "백엔드 열어줘" 요청
2. `messages` 테이블에서 메시지 조회/삭제

## 향후 구현 예정 기능

### 초대장 내용 편집
- 신랑/신부 이름 변경
- 결혼식 날짜/시간 수정
- Hero 섹션 문구 편집

### 미디어 관리
- 사진/동영상 업로드
- 갤러리 순서 변경
- 미디어 설명 추가

### 장소 정보 편집
- 웨딩홀 이름/주소 수정
- 지도 좌표 변경
- 교통 안내 추가

### 메시지 보드 관리
- 메시지 검색/필터링
- 부적절한 메시지 삭제
- 메시지 통계 확인

## 데이터 직접 편집 (고급)

Lovable Cloud 백엔드를 통해 직접 데이터를 편집할 수 있습니다:

### 초대장 정보 수정
```sql
-- invitation 테이블 조회
SELECT * FROM invitation;

-- 신랑/신부 이름 변경
UPDATE invitation 
SET couple_groom = '홍길동', 
    couple_bride = '김영희'
WHERE id = '<uuid>';

-- Hero 문구 변경
UPDATE invitation 
SET hero_line1 = '새로운 문구 1',
    hero_line2 = '새로운 문구 2',
    hero_line3 = '새로운 문구 3'
WHERE id = '<uuid>';
```

### 장소 정보 수정
```sql
-- venue 테이블 조회
SELECT * FROM venue;

-- 장소 정보 변경
UPDATE venue 
SET name = '새로운 웨딩홀',
    address = '서울시 강남구 테헤란로 123',
    lat = 37.5012,
    lng = 127.0396
WHERE id = '<uuid>';
```

### 미디어 자산 추가
```sql
-- 이미지 추가
INSERT INTO media_assets (type, url, sort_order)
VALUES ('image', 'https://example.com/photo.jpg', 1);

-- 텍스트 추가
INSERT INTO media_assets (type, content, sort_order)
VALUES ('text', '우리의 특별한 순간', 2);
```

## 보안 주의사항

1. **관리자 비밀번호 변경**
   - 기본 비밀번호(`1234`)는 테스트용입니다
   - 실제 운영 전 반드시 강력한 비밀번호로 변경하세요

2. **메시지 비밀번호**
   - 사용자가 작성한 메시지는 비밀번호로 보호됩니다
   - 관리자는 비밀번호 없이도 삭제 가능합니다

3. **데이터 백업**
   - 중요한 변경 전 데이터를 백업하세요
   - Lovable Cloud에서 백업 기능 제공

## 문제 발생 시

### 로그인이 안 되는 경우
1. `admin@admin.com` 계정이 생성되었는지 확인
2. 비밀번호가 `1234`인지 확인
3. 콘솔 에러 메시지 확인

### 데이터가 안 보이는 경우
1. Lovable Cloud 백엔드에서 테이블 확인
2. 브라우저 캐시 삭제 후 새로고침
3. RLS 정책 확인

### 관리자 권한이 없는 경우
```sql
-- profiles 테이블에서 role 확인
SELECT * FROM profiles WHERE id = auth.uid();

-- 관리자 권한 수동 부여
UPDATE profiles 
SET role = 'admin' 
WHERE id = '<user_uuid>';
```

## 도움말

더 자세한 정보는:
- [Lovable Cloud 문서](https://docs.lovable.dev/features/cloud)
- [Supabase 문서](https://supabase.com/docs)
- 채팅창에서 AI에게 질문하기
