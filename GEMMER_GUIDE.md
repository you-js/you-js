# Gemmer 엔진 가이드 (v0.2.6)

Gemmer는 JavaScript 기반의 초경량 2D ECS(Entity Component System) 게임 엔진입니다. Vite와 Electron을 기반으로 하여, 웹과 데스크탑(Windows, Mac, Linux) 애플리케이션을 동시에 개발하고 배포할 수 있습니다.

---

## 1. 시작하기 (Getting Started)

가장 빠르게 프로젝트를 시작하는 방법은 CLI 도구를 사용하는 것입니다.

### 프로젝트 생성
터미널에서 다음 명령어를 실행하여 새로운 게임 프로젝트를 생성합니다.

```bash
npx create-gemmer my-awesome-game
cd my-awesome-game
npm install
```

### 실행 및 빌드
- **개발 모드 (Web):** 브라우저에서 실시간으로 게임을 확인하며 개발합니다.
  ```bash
  npm run dev
  ```
- **데스크탑 빌드 (Electron):** Windows/Mac/Linux용 실행 파일(.exe, .dmg 등)을 생성합니다.
  ```bash
  npm run dist
  ```

---

## 2. 프로젝트 구조 (Project Structure)

생성된 프로젝트의 기본 구조는 다음과 같습니다.

```
my-awesome-game/
├── src/
│   ├── main.js        # 게임 진입점 (Entry Point)
│   └── game.js        # 게임 로직 및 설정
├── assets/            # 이미지, 사운드 등 리소스 폴더
├── index.html         # 웹 진입점
├── electron-main.js   # Electron 설정 (수정 불필요)
└── package.json
```

---

## 3. 핵심 개념 (Core Concepts)

Gemmer는 **ECS 패턴**을 따르지만, 사용 편의성을 위해 객체 지향적(OOP) 접근도 허용합니다.

### 3.1 Game (게임 관리자)
게임의 루프(Loop), 엔티티 관리, 렌더링을 담당하는 싱글톤 객체입니다.

```javascript
import { game } from 'gemmer';

// 게임 초기화 (해상도 설정)
game.init({ width: 800, height: 600 });

// 엔티티 추가
game.add(new Player());

// 게임 시작
game.start();
```

### 3.2 Entity (엔티티)
게임 월드에 존재하는 모든 객체입니다. 기본적으로 `Transform` 컴포넌트를 내장하고 있어 위치, 회전, 크기를 가집니다.

```javascript
import { Entity } from 'gemmer';

const box = new Entity(100, 100); // x=100, y=100 위치에 생성
box.scale.set(2, 2);              // 2배 크기
game.add(box);
```

### 3.3 Component (컴포넌트)
엔티티에 기능(렌더링, 물리, 스크립트 등)을 부여하는 모듈입니다.

```javascript
import { Entity, SpriteRenderer, Sprite, BoxCollider } from 'gemmer';

class Player extends Entity {
    constructor() {
        super(0, 0);
        
        // 1. 이미지 렌더러 추가
        this.sprite = new Sprite('assets/player.png');
        this.addComponent(new SpriteRenderer(this.sprite));
        
        // 2. 충돌체 추가
        this.addComponent(new BoxCollider({ width: 32, height: 32 }));
    }
}
```

---

## 4. 주요 API 가이드

### 4.1 생명주기 (Lifecycle)
엔티티나 컴포넌트를 상속받아 아래 메서드를 구현하면 엔진이 자동으로 호출합니다.

- `onAdd(game)`: 게임 월드에 추가될 때 호출
- `update(deltaTime)`: 매 프레임 호출 (로직 구현)
- `draw(context)`: 렌더링 시 호출 (주로 커스텀 그리기용)
- `onRemove(game)`: 게임 월드에서 제거될 때 호출
- `onDestroy()`: 객체가 완전히 파괴될 때 호출

```javascript
update(deltaTime) {
    // deltaTime: 이전 프레임과의 시간 차이 (초 단위)
    this.x += 100 * deltaTime; // 초당 100픽셀 이동
}
```

### 4.2 입력 처리 (Input)
키보드와 마우스 입력을 처리합니다.

```javascript
import { input, Vector2 } from 'gemmer';

update(dt) {
    // 키보드
    if (input.isKeyDown('ArrowRight')) {
        this.x += this.speed * dt;
    }
    
    // 마우스 (Canvas 좌표계 기준 자동 보정됨)
    if (input.wasMouseButtonPressed(0)) { // 0: 좌클릭
        console.log('Click at:', input.mouse.x, input.mouse.y);
    }
}
```

### 4.3 계층 구조 (Hierarchy)
부모-자식 관계를 통해 좌표 종속성을 만들 수 있습니다.

```javascript
const parent = new Entity(100, 100);
const child = new Entity(10, 0);

// child는 parent를 따라다님
child.transform.setParent(parent); 
// 또는
parent.transform.addChild(child.transform);
```

### 4.4 컴포넌트 관리
`v0.2.6` 부터 `hasComponent`가 추가되었습니다.

```javascript
const entity = new Entity();

entity.addComponent(new BoxCollider());

if (entity.hasComponent(BoxCollider)) {
    const collider = entity.getComponent(BoxCollider);
    // ...
}
```

---

## 5. 빌드 및 배포 (Build & Distribute)

`package.json`에 `electron-builder` 설정이 미리 되어 있습니다.

1. `package.json`의 `build` 섹션에서 `productName`, `appId`를 본인의 게임에 맞게 수정합니다.
2. 아래 명령어를 실행합니다.

```bash
npm run dist
```

3. `release/` 폴더에 설치 파일(Setup.exe) 또는 실행 파일이 생성됩니다.
