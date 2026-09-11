[**한국어**](./GEMMER_GUIDE.ko.md) | [English](./GEMMER_GUIDE.en.md)

# Gemmer 엔진 가이드 (v0.2.11)

Gemmer는 JavaScript 기반의 경량 2D ECS(Entity Component System) 게임 엔진입니다. Vite를 이용해 웹 게임을 개발하고 Electron과 `electron-builder`를 이용해 데스크톱 애플리케이션으로 배포할 수 있습니다.

## 1. 개발 환경 구축

### 1.1 준비 사항

다음 도구를 준비합니다.

- Node.js 18 이상(활성 LTS 버전 권장)
- Node.js와 함께 설치되는 npm
- 최신 웹 브라우저
- 원하는 코드 편집기

터미널에서 설치 상태를 확인합니다.

```bash
node --version
npm --version
```

### 1.2 게임 프로젝트 생성

`create-gemmer`를 사용해 새 프로젝트를 생성하고 의존성을 설치합니다.

```bash
npx create-gemmer my-awesome-game
cd my-awesome-game
npm install
```

생성된 프로젝트에는 Gemmer, Vite, Electron, `electron-builder`를 사용하는 기본 설정이 포함됩니다.

## 2. 개발, 빌드, 배포

### 2.1 웹 개발 서버

```bash
npm run dev
```

Vite가 출력한 로컬 주소를 브라우저에서 엽니다. 소스 파일을 수정하면 변경 사항이 자동으로 반영됩니다.

### 2.2 Electron 개발 실행

Electron은 실행 중인 Vite 개발 서버에 연결합니다. 첫 번째 터미널에서 웹 개발 서버를 유지합니다.

```bash
npm run dev
```

두 번째 터미널을 열어 Electron을 실행합니다.

```bash
npm run electron
```

기본 Electron 설정은 `http://localhost:5173`에 연결하므로 Vite가 다른 포트를 사용한다면 `electron-main.js`의 개발 서버 주소도 맞춰야 합니다.

### 2.3 웹 프로덕션 빌드와 미리보기

```bash
npm run build
npm run preview
```

웹 빌드 결과는 `dist/`에 생성됩니다. `npm run preview`가 출력한 주소에서 프로덕션 빌드를 확인할 수 있습니다.

### 2.4 데스크톱 배포

배포 전에 `package.json`의 `build.appId`와 `build.productName`을 게임에 맞게 수정합니다. 그다음 데스크톱 패키지를 생성합니다.

```bash
npm run dist
```

이 명령은 웹 빌드를 먼저 생성한 뒤 `electron-builder`를 실행합니다. 결과물은 `release/`에 생성되며, 운영체제와 빌드 대상에 따라 압축 해제된 애플리케이션 디렉터리, `.dmg`, `.AppImage` 등의 형식이 사용됩니다. 각 운영체제용 결과물은 해당 운영체제에서 빌드하는 것을 기본으로 합니다.

## 3. 프로젝트 구조

생성 직후의 주요 파일은 다음과 같습니다. `assets/`는 이미지나 오디오가 필요할 때 추가합니다.

```text
my-awesome-game/
├── src/
│   └── main.js        # 게임 진입점
├── assets/            # 선택 사항: 이미지와 오디오 리소스
├── electron-main.js   # Electron 진입점
├── index.html         # 웹 진입점
├── package.json       # 스크립트와 패키징 설정
└── vite.config.js     # Vite 빌드 설정
```

게임 로직은 `src/` 아래에 모듈로 분리하고 `src/main.js`에서 불러오는 방식으로 확장할 수 있습니다.

## 4. 핵심 개념

Gemmer는 엔티티에 컴포넌트를 조합하는 ECS 방식을 사용하며, `Entity`나 `Component`를 상속해 게임 로직을 구성할 수도 있습니다.

### 4.1 Game

`game`은 게임 루프, 캔버스와 충돌 시스템을 관리하는 싱글톤이며, 엔티티는 `Scene`이 소유합니다.

```javascript
import { game, Scene } from 'gemmer';

game.init({ width: 800, height: 600 });
game.changeScene(new Scene());
game.start();
```

`game.init()`은 Canvas를 생성해 지정한 부모 요소에 추가하며, 부모를 생략하면 `document.body`를 사용합니다.

### Scene

`new Game(new Scene())`으로 생성 시 Scene을 지정할 수 있습니다. 생략하면
`currentScene`은 `null`이며 화면 초기화와 프레임 입력 정리만 실행합니다.
싱글톤은 위 예제처럼 `changeScene(scene)`으로 지정합니다.

전환은 다음 프레임 시작에 적용됩니다. 활성 Scene이 없을 때 `game.add/remove`는 오류를
발생시키므로, 아래 엔티티 코드는 Scene 진입 이후나 `Scene.enter()`에서 실행합니다.
`changeScene(null)`은 기존 Scene을 정리하고 빈 화면으로 돌아갑니다.
종료한 Scene은 재사용하지 않으며, 재시작에는 새 인스턴스를 전달합니다.

`enter()`, `exit()`, `update(deltaTime)`, `draw(context)`를 재정의할 수 있습니다.
엔티티 순회는 엔진이 별도로 수행하므로 훅에서 `super`를 호출할 필요가 없습니다.
직접 등록한 이벤트와 타이머는 `exit()`에서 해제하고, 리소스는 전환 전에 로딩합니다.
실행 예제: `examples/scene-app/index.html` (Enter로 타이틀 → 플레이 → 결과 → 재시작).

### 4.2 Entity

`Entity`는 게임 월드의 객체입니다. 생성할 때 위치와 크기를 지정할 수 있고 `Transform` 컴포넌트가 자동으로 추가됩니다.

```javascript
import { Entity, game } from 'gemmer';

const box = new Entity(100, 100, 32, 32);
box.scale.set(2, 2);
game.add(box);
```

### 4.3 Component

`Component`를 상속해 엔티티에 동작을 추가합니다. 생명주기 메서드는 기본 구현이 있으므로 필요한 메서드만 재정의할 수 있습니다.

```javascript
import { Component, Entity, game, input } from 'gemmer';

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

const player = new Entity(400, 300);
player.addComponent(new PlayerController());
game.add(player);
```

### 4.4 Sprite와 충돌체

```javascript
import { BoxCollider, Entity, Sprite, SpriteRenderer } from 'gemmer';

const player = new Entity(400, 300, 32, 32);
const sprite = new Sprite('assets/player.png');

player.addComponent(new SpriteRenderer(sprite));
player.addComponent(new BoxCollider({ width: 32, height: 32 }));
```

`SpriteRenderer`는 엔티티의 변환을 적용해 이미지를 그립니다. `BoxCollider`는 회전하지 않는 AABB 충돌 영역을 제공합니다.

## 5. 주요 API

### 5.1 생명주기

`Entity`에서 사용할 수 있는 주요 메서드는 다음과 같습니다.

- `onAdd(game)`: 엔티티가 게임 월드에 추가될 때 호출
- `start()`: 엔티티가 처음 처리될 때 호출
- `update(deltaTime)`: 매 프레임 게임 로직을 갱신할 때 호출
- `draw(context)`: 매 프레임 Canvas에 그릴 때 호출
- `onRemove(game)`: 엔티티가 게임 월드에서 제거될 때 호출
- `destroy()`: 엔티티를 비활성화하고 제거 대상으로 표시

`Component`의 주요 생명주기는 다음과 같습니다.

- `onAttach(entity)`: 컴포넌트가 엔티티에 연결될 때 호출
- `start()`: 첫 번째 업데이트 전에 한 번 호출
- `update(deltaTime)`: 활성화된 동안 매 프레임 호출
- `draw(context)`: 엔티티의 변환이 적용된 Canvas 컨텍스트와 함께 호출
- `onDetach()`: `removeComponent()`로 분리될 때 호출
- `onDestroy()`: 소유 엔티티가 파괴될 때 호출

### 5.2 입력 처리

```javascript
import { Component, input } from 'gemmer';

class PlayerController extends Component {
    update(deltaTime) {
        if (input.isKeyDown('ArrowRight')) {
            this.entity.x += 200 * deltaTime;
        }

        if (input.wasMouseButtonPressed(0)) {
            console.log('Click at:', input.mouse.x, input.mouse.y);
        }
    }
}
```

`input.mouse`는 Canvas가 존재할 때 Canvas 좌표로 보정됩니다. 키와 마우스의 pressed/released 상태는 프레임마다 초기화됩니다.

### 5.3 부모-자식 계층

```javascript
import { Entity } from 'gemmer';

const parent = new Entity(100, 100);
const child = new Entity(10, 0);

child.transform.setParent(parent);
```

자식의 전역 위치, 회전, 크기는 부모의 `Transform`을 반영해 계산됩니다.

### 5.4 컴포넌트 관리

```javascript
import { BoxCollider, Entity } from 'gemmer';

const entity = new Entity();
const collider = new BoxCollider({ width: 32, height: 32 });

entity.addComponent(collider);

if (entity.hasComponent(BoxCollider)) {
    const attachedCollider = entity.getComponent(BoxCollider);
    console.log(attachedCollider.bounds);
}

entity.removeComponent(collider);
```

`addComponent()`에는 `Component` 인스턴스만 전달할 수 있습니다. `removeComponent()`는 해당 컴포넌트의 `onDetach()`를 호출합니다.
