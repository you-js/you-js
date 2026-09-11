**한국어** | [English](./README.en.md)

# Gemmer

Gemmer는 JavaScript, Vite, Electron으로 만든 가볍고 현대적인 2D 게임 엔진입니다. 단순하고 편리하게 사용할 수 있도록 설계된 견고한 엔티티-컴포넌트-시스템(ECS) 아키텍처를 제공합니다.

## 주요 기능

- **ECS 아키텍처:** 유연한 `Entity`, `Component`, `System` 구조
- **렌더링:** 이미지 영역 잘라내기와 피벗을 지원하는 Canvas 기반 `SpriteRenderer`
- **애니메이션:** 프레임 기반 `Animator` 시스템
- **물리:** `BoxCollider`를 이용한 AABB 충돌 감지
- **입력:** 키보드와 마우스를 통합 지원하는 `InputManager`
- **오디오:** 배경 음악과 효과음을 관리하는 `AudioManager`
- **크로스 플랫폼:** 웹 및 Electron 기반 데스크톱 앱 빌드 지원

## 시작하기

### 설치

```bash
npm install gemmer
```

> 현재 로컬 개발 중인 프로젝트입니다. 필요한 경우 저장소를 복제하여 사용하세요.

### 빠른 시작

#### 1. 게임 초기화

```javascript
import { Game, Scene } from 'gemmer';

const game = new Game(new Scene());

game.init({
    width: 800,
    height: 600,
});

game.start();
```

#### 2. 엔티티 생성

```javascript
import { Entity, SpriteRenderer, Sprite } from 'gemmer';

// (400, 300) 위치에 플레이어 엔티티 생성
const player = new Entity(400, 300);

// 스프라이트 컴포넌트 추가
const sprite = new Sprite('assets/player.png');
player.addComponent(new SpriteRenderer(sprite));

// 게임 월드에 추가
game.add(player);
```

#### 3. 사용자 정의 컴포넌트 생성

```javascript
import { Component, input } from 'gemmer';

class PlayerController extends Component {
    update(deltaTime) {
        const speed = 200;

        if (input.isKeyDown('ArrowRight')) {
            this.entity.x += speed * deltaTime;
        }
        if (input.isKeyDown('ArrowLeft')) {
            this.entity.x -= speed * deltaTime;
        }
    }
}

player.addComponent(new PlayerController());
```

## 아키텍처 개요

### 핵심 요소

- **Game:** 게임 루프, 엔티티, 시스템을 관리하는 중심 객체
- **Entity:** 게임 월드에 존재하는 범용 객체로, 위치·회전·크기를 관리하는 `Transform`을 기본 제공
- **Component:** `SpriteRenderer`, `BoxCollider`처럼 엔티티에 데이터나 동작을 추가하는 객체

### 시스템

- **InputManager (`input`):** 사용자 입력 처리
    - `input.isKeyDown(key)`
    - `input.mouse`
- **AudioManager (`audio`):** 사운드 처리
    - `audio.play('bgm')`
    - `audio.playOneShot('sfx')`

## 문서

- [한국어 Gemmer 엔진 가이드](./GEMMER_GUIDE.ko.md)
- [English Gemmer Engine Guide](./GEMMER_GUIDE.en.md)

## 개발

### 스크립트

- `npm run dev`: Vite 개발 서버 실행
- `npm run electron`: `npm run dev`가 실행 중일 때 Electron 데스크톱 앱 실행
- `npm run test`: 헤드리스 단위 테스트 실행
- `npm run lint`: ESLint 검사 실행
- `npm run build:lib`: npm 배포용 엔진 라이브러리 빌드
- `npm run build:game`: 게임의 웹 배포용 빌드 생성
- `npm run dist`: 게임을 데스크톱 애플리케이션으로 빌드 및 패키징

## 라이선스

MIT
