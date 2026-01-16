# 프로젝트 지침: Gemmer (Vite + Electron 마이그레이션)

본 프로젝트는 순수 JavaScript 기반의 `gemmer` 엔진을 유지하면서, Vite와 Electron을 도입하여 현대적인 빌드 환경으로 마이그레이션하는 것을 목표로 합니다.

## 1. 빌드 및 실행 (Build & Run)

현재 `package.json` 도입 예정 단계이며, 다음 명령어를 표준으로 가정하고 작업하십시오.

- **개발:** `npm run dev` (Vite 개발 서버 실행)
- **빌드:** `npm run build` (Electron 및 Web 배포용 빌드)
- **테스트:** `npm run test` (Jest 또는 Vitest 도입 예정)

## 2. 코드 스타일 및 구조 (Code Style & Structure)

- **언어:** JavaScript (ES Modules). TypeScript 변환은 명시적 요청이 있을 때만 수행하십시오.
- **디렉토리 구조:** `gemmer/` 폴더 내의 기존 모듈 구조(framework, graphic, object, ui 등)를 **엄격히 유지**하십시오.
- **네이밍 규칙:**
    - 파일명: `kebab-case` (예: `asset-manager.js`)
    - 변수/함수명: `camelCase`
    - 클래스명: `PascalCase`
    - **축약어 금지:** 변수, 함수, 파라미터 이름 등은 `dt`, `ctx`, `cfg`와 같은 축약어를 사용하지 말고, `deltaTime`, `context`, `configuration`과 같이 의미가 명확한 전체 단어(Full Name)를 사용하십시오.

## 3. 핵심 패턴 및 아키텍처 (Core Patterns)

기존 코드베이스의 철학을 존중하여 다음 패턴을 따르십시오.

- **전역 접근:** `gemmer.js`에서와 같이 `globalThis`를 활용한 전역 네임스페이스 접근을 허용합니다 (예: `gemmer.core`, `gemmer.screen`).
- **디자인 패턴:** Core, Screen 등의 주요 모듈은 **Singleton** 패턴을, 리소스 로딩 등은 **Factory/Parser** 패턴을 유지하십시오.
- **플랫폼 감지:** `window.electronContextBridge` 존재 여부로 Desktop/Web 환경을 구분하십시오 (`platform.js` 로직 참조).

## 4. 마이그레이션 원칙 (Migration Guidelines)

- **래핑(Wrapping) 전략:** `gemmer` 내부 코드를 직접 수정하여 프레임워크에 맞추지 마십시오. 대신, Vite의 엔트리 포인트(`main.js` 등)에서 `gemmer`를 import하고 초기화하는 래퍼 방식을 사용하십시오.
- **디펜던시:** 불필요한 외부 라이브러리 추가를 지양하고, 기존의 순수 JS 구현을 우선시하십시오.
- **주석:** 코드 내 주석은 간결하게 작성하고, 불필요하게 긴 설명이나 사고 과정을 포함하지 마십시오.

## 5. 추가 지침 (Other Instructions)

- 주석은 간결하고 명확하게 유지하십시오.
- **몽키 패칭 및 동적 할당 금지:** 
    - 런타임에 동적으로 속성이나 메서드를 추가하거나 덮어쓰는(Monkey Patching) 행위를 엄격히 금지합니다.
    - 특히, 인터페이스가 명확하지 않은 메서드(예: `component.onDetach?.()`)를 옵셔널 체이닝으로 호출하는 패턴을 지양하십시오. 
    - 모든 메서드와 속성은 클래스나 객체 정의 시점에 명시적으로 선언되어야 하며, `start()`, `update()`, `onDetach()`와 같은 생명주기 메서드는 반드시 기본 구현체(빈 함수라도)를 포함해야 합니다.
