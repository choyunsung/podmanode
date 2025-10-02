# podmanode

Node.js용 Podman 및 Docker 호환 Remote API 모듈

[dockerode](https://github.com/apocas/dockerode)를 포크하여 Podman 지원을 추가했습니다.

## `podmanode`의 목표:

* **Podman & Docker 호환성** - Podman과 Docker 양쪽 모두와 원활하게 작동
* **자동 감지** - Podman 소켓(rootless 및 rootful)을 자동으로 감지하거나 Docker로 폴백
* **스트림** - 어떤 스트림도 깨뜨리지 않고 그대로 전달하여 스트림 활용 가능
* **스트림 역다중화** - 선택적 [스트림 역다중화](#헬퍼-함수) 지원
* **엔티티** - 컨테이너, 이미지, exec은 무작위 정적 메서드가 아닌 정의된 엔티티
* **run** - `docker run` / `podman run`처럼 컨테이너에서 명령을 원활하게 실행
* **테스트** - `Docker`/`Podman` 변경 사항을 쉽고 빠르게 따라갈 수 있는 우수한 테스트 세트 제공
* **기능 풍부** - 호환 가능한 **모든** Remote API 기능을 구현하기 위한 노력
* **인터페이스** - **콜백** 및 **프로미스** 기반 인터페이스를 모두 지원 :)

## ⚠️ Podman 제한사항

- **Swarm은 지원되지 않음** - Podman은 Docker Swarm을 지원하지 않습니다. Podman에 연결된 경우 모든 swarm 관련 메서드(swarmInit, swarmJoin, swarmLeave, swarmUpdate, swarmInspect 및 관련 Service/Task/Node/Secret/Config 작업)가 실패합니다.

## 🚀 Podman 전용 기능

Podman은 **Pods**를 제공합니다 - 동일한 네트워크, IPC 및 UTS 네임스페이스를 공유하는 하나 이상의 컨테이너 그룹입니다. 이것은 Docker Swarm 서비스에 대한 Podman의 대안입니다.

### Pod 사용하기

```js
var Docker = require('podmanode');
var docker = new Docker();

// Pod 생성
docker.createPod({
  name: 'my-pod',
  portmappings: [
    {
      container_port: 80,
      host_port: 8080
    }
  ]
}).then(function(pod) {
  console.log('Pod created:', pod.id);

  // Pod 시작
  return pod.start();
}).then(function(data) {
  console.log('Pod started');
}).catch(function(err) {
  console.log(err);
});

// 모든 Pod 목록 조회
docker.listPods(function(err, pods) {
  console.log(pods);
});

// 특정 Pod 가져오기
var pod = docker.getPod('my-pod');

// Pod 검사
pod.inspect(function(err, data) {
  console.log(data);
});

// Pod 중지
pod.stop(function(err, data) {
  console.log('Pod stopped');
});

// Pod 삭제
pod.remove(function(err, data) {
  console.log('Pod removed');
});

// 미사용 Pod 정리
docker.prunePods(function(err, data) {
  console.log('Pruned pods:', data);
});
```

## 생태계

 * docker-modem [https://github.com/apocas/docker-modem](https://github.com/apocas/docker-modem) - Docker의 API 네트워크 스택
 * dockerode-compose [https://github.com/apocas/dockerode-compose](https://github.com/apocas/dockerode-compose) - Node.js용 docker-compose

## 설치

```bash
npm install podmanode
```

## 사용법

 * 입력 옵션은 컨테이너 엔진 API로 직접 전달됩니다. 자세한 내용은 [Docker API 문서](https://docs.docker.com/engine/api/latest/) 또는 [Podman API 문서](https://docs.podman.io/en/latest/_static/api.html)를 확인하세요.
 * 반환 값은 컨테이너 엔진에서 변경되지 않으며, 공식 문서도 동일하게 적용됩니다.
 * 더 많은 예제는 tests 및 examples 폴더를 확인하세요.

### 시작하기

`podmanode`를 사용하려면 먼저 인스턴스화해야 합니다:

``` js
var Docker = require('podmanode');

// 자동 감지: Podman 소켓을 먼저 시도하고 Docker로 폴백
var docker = new Docker();

// Podman rootless (비root 사용자의 기본값)
var docker1 = new Docker({socketPath: '/run/user/1000/podman/podman.sock'});

// Podman rootful
var docker2 = new Docker({socketPath: '/run/podman/podman.sock'});

// Docker (전통적)
var docker3 = new Docker({socketPath: '/var/run/docker.sock'});

// 원격 연결도 동일하게 작동
var docker4 = new Docker({host: 'http://192.168.1.10', port: 3000});
var docker5 = new Docker({protocol:'http', host: '127.0.0.1', port: 3000});
var docker6 = new Docker({host: '127.0.0.1', port: 3000}); //기본값은 http

// 프로토콜 http vs https 자동 감지
var docker7 = new Docker({
  host: '192.168.1.10',
  port: process.env.DOCKER_PORT || 2375,
  ca: fs.readFileSync('ca.pem'),
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem'),
  version: 'v1.40' // Podman은 Docker API v1.40+와 호환
});

var docker8 = new Docker({
  protocol: 'https', // 프로토콜을 강제할 수 있음
  host: '192.168.1.10',
  port: process.env.DOCKER_PORT || 2375,
  ca: fs.readFileSync('ca.pem'),
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem')
});

// 다른 프로미스 라이브러리 사용 (기본값은 네이티브)
var docker9 = new Docker({
  Promise: require('bluebird')
  //...
});
//...
```

### 컨테이너 조작:

``` js
// 컨테이너 엔티티 생성. API 쿼리하지 않음
var container = docker.getContainer('71501a8ab0f8');

// 컨테이너 정보를 위한 API 쿼리
container.inspect(function (err, data) {
  console.log(data);
});

container.start(function (err, data) {
  console.log(data);
});

container.remove(function (err, data) {
  console.log(data);
});

// 프로미스 지원
var auxContainer;
docker.createContainer({
  Image: 'ubuntu',
  AttachStdin: false,
  AttachStdout: true,
  AttachStderr: true,
  Tty: true,
  Cmd: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
  OpenStdin: false,
  StdinOnce: false
}).then(function(container) {
  auxContainer = container;
  return auxContainer.start();
}).then(function(data) {
  return auxContainer.resize({
    h: process.stdout.rows,
    w: process.stdout.columns
  });
}).then(function(data) {
  return auxContainer.stop();
}).then(function(data) {
  return auxContainer.remove();
}).then(function(data) {
  console.log('container removed');
}).catch(function(err) {
  console.log(err);
});
```

각 컨테이너의 작업에 대한 기본 옵션을 지정할 수도 있으며, 이는 지정된 컨테이너 및 작업에 항상 사용됩니다.

``` js
container.defaultOptions.start.Binds = ["/tmp:/tmp:rw"];
```

### 호스트의 모든 컨테이너 중지

``` js
docker.listContainers(function (err, containers) {
  containers.forEach(function (containerInfo) {
    docker.getContainer(containerInfo.Id).stop(cb);
  });
});
```

### 이미지 빌드
컨텍스트: Dockerfile 경로를 제공합니다. 빌드에 포함되는 추가 파일은 src 배열에 명시적으로 언급되어야 하며, 임시 환경으로 전송되어 빌드됩니다. 예: COPY 명령의 파일은 임시 환경에서 추출됩니다.

``` js
docker.buildImage('archive.tar', {t: imageName}, function (err, response){
  //...
});

docker.buildImage({
  context: __dirname,
  src: ['Dockerfile', 'file1', 'file2']
}, {t: imageName}, function (err, response) {
  //...
});
```

`buildImage`는 NodeJS 스트림의 Promise를 반환합니다. 빌드가 완료되는 시점을 알고 싶다면 `modem` 인스턴스로 빌드 진행 상황을 따라가야 합니다:

``` js
let podmanode = new Podmanode();
let stream = await podmanode.buildImage(...);
await new Promise((resolve, reject) => {
  podmanode.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
});
// 빌드 완료
```

### 컨테이너 생성:

``` js
docker.createContainer({Image: 'ubuntu', Cmd: ['/bin/bash'], name: 'ubuntu-test'}, function (err, container) {
  container.start(function (err, data) {
    //...
  });
});
//...
```

### 스트림 장점:

``` js
//tty:true
docker.createContainer({ /*...*/ Tty: true /*...*/ }, function(err, container) {

  /* ... */

  container.attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
    stream.pipe(process.stdout);
  });

  /* ... */
});

//tty:false
docker.createContainer({ /*...*/ Tty: false /*...*/ }, function(err, container) {

  /* ... */

  container.attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
    // podmanode가 attach 스트림을 역다중화할 수 있습니다 :)
    container.modem.demuxStream(stream, process.stdout, process.stderr);
  });

  /* ... */
});

docker.createImage({fromImage: 'ubuntu'}, function (err, stream) {
  stream.pipe(process.stdout);
});

//...
```

stdin과 stdout을 별도로 작동하는 명령과 더 깔끔하게 상호작용할 수 있는 [HTTP 연결 하이재킹](https://docs.docker.com/engine/api/v1.45/#tag/Container/operation/ContainerAttach)도 지원합니다.

```js
docker.createContainer({Tty: false, /*... 기타 옵션 */}, function(err, container) {
  container.start(function(err) {
    container.exec({Cmd: ['shasum', '-'], AttachStdin: true, AttachStdout: true}, function(err, exec) {
      exec.start({hijack: true, stdin: true}, function(err, stream) {
        // shasum은 stdin이 닫힌 후에야 완료될 수 있으며, 합계를 계산하는 데 필요한 모든 바이트를 읽었음을 알립니다.
        // 소켓 업그레이드 없이는 읽기 측도 닫지 않고 쓰기 측만 닫을 방법이 없습니다!
        fs.createReadStream('node-v5.1.0.tgz', 'binary').pipe(stream);

        // 다행히 이제 일반 TCP 소켓이 있으므로 readstream이 완료되고 스트림을 닫을 때
        // 읽기를 위해 여전히 열려 있어 결과를 받을 수 있습니다 :-)
        docker.modem.demuxStream(stream, process.stdout, process.stderr);
      });
    });
  });
});
```

### `podmanode`에서 `docker run`과 동등한 기능:

* `image` - 컨테이너 이미지
* `cmd` - 실행할 명령
* `stream` - 실행 출력에 사용할 스트림
* `create_options` - (선택) 컨테이너 생성에 사용되는 옵션. 가능한 값은 [DockerEngine ContainerCreate 문서](https://docs.docker.com/engine/api/v1.37/#operation/ContainerCreate) 참조
* `start_options` - (선택) 컨테이너 시작에 사용되는 옵션. 가능한 값은 [DockerEngine ContainerStart 문서](https://docs.docker.com/engine/api/v1.37/#operation/ContainerStart) 참조
* `callback` - 실행이 끝날 때 호출되는 콜백 (선택, 사용하지 않으면 프로미스 반환)

``` js
// 콜백
docker.run('ubuntu', ['bash', '-c', 'uname -a'], process.stdout, function (err, data, container) {
  console.log(data.StatusCode);
});

// 프로미스
docker.run(testImage, ['bash', '-c', 'uname -a'], process.stdout).then(function(data) {
  var output = data[0];
  var container = data[1];
  console.log(output.StatusCode);
  return container.remove();
}).then(function(data) {
  console.log('container removed');
}).catch(function(err) {
  console.log(err);
});
```

또는 stdout과 stderr를 분리하려면 (`Tty:false`를 옵션으로 전달해야 작동합니다)

``` js
docker.run('ubuntu', ['bash', '-c', 'uname -a'], [process.stdout, process.stderr], {Tty:false}, function (err, data, container) {
  console.log(data.StatusCode);
});
```

콜백을 제공하면 `run`은 다음 이벤트를 지원하는 EventEmitter를 반환합니다: container, stream, data.
콜백이 제공되지 않으면 프로미스가 반환됩니다.

``` js
docker.run('ubuntu', ['bash', '-c', 'uname -a'], [process.stdout, process.stderr], {Tty:false}, function (err, data, container) {
  //...
}).on('container', function (container) {
  //...
});
```

다음은 자동 제거 및 Docker 네트워크를 사용하는 더 복잡한 예제입니다.

``` js
docker.run('some-python-image', ['python', 'main.py', arg], process.stdout, {name: 'my-python-container', HostConfig: { AutoRemove: true, NetworkMode: 'my_network'}}, function(err, data, container) {
  // 작업 수행
});
```

### `podmanode`에서 `docker pull`과 동등한 기능:

* `repoTag` - 컨테이너 이미지 이름 (선택적으로 태그 포함)
  `myrepo/myname:withtag`
* `options` - 이미지 생성에 전달되는 추가 옵션
* `callback` - 실행이 끝날 때 호출되는 콜백

``` js
docker.pull('myrepo/myname:tag', function (err, stream) {
  // pull의 스트리밍 출력...
});
```

#### 프라이빗 저장소에서 Pull

`docker-modem`이 이미 필요한 인증 객체를 base64로 인코딩합니다.

``` js
var auth = {
  username: 'username',
  password: 'password',
  auth: '',
  email: 'your@email.email',
  serveraddress: 'https://index.docker.io/v1'
};

docker.pull('tag', {'authconfig': auth}, function (err, stream) {
  //...
});
```

이미 base64로 인코딩된 인증 객체가 있다면 직접 사용할 수 있습니다:

```js
var auth = { key: 'yJ1J2ZXJhZGRyZXNzIjoitZSI6Im4OCIsImF1dGgiOiIiLCJlbWFpbCI6ImZvbGllLmFkcmc2VybmF0iLCJzZX5jb2aHR0cHM6Ly9pbmRleC5kb2NrZXIuaW8vdZvbGllYSIsInBhc3N3b3JkIjoiRGVjZW1icmUjEvIn0=' }
```

## 헬퍼 함수

* `followProgress` - 스트림 기반 프로세스의 끝에서만 콜백을 실행할 수 있게 합니다. (build, pull, ...)

``` js
//followProgress(stream, onFinished, [onProgress])
docker.pull(repoTag, function(err, stream) {
  //...
  docker.modem.followProgress(stream, onFinished, onProgress);

  function onFinished(err, output) {
    //output은 JSON 파싱된 객체의 배열
    //...
  }
  function onProgress(event) {
    //...
  }
});
```

* `demuxStream` - stdout과 stderr 역다중화

``` js
//demuxStream(stream, stdout, stderr)
container.attach({
  stream: true,
  stdout: true,
  stderr: true
}, function handler(err, stream) {
  //...
  container.modem.demuxStream(stream, process.stdout, process.stderr);
  //...
});
```

## 후원자

제 오픈소스 작업을 [후원](https://github.com/sponsors/apocas)하는 훌륭한 단체들입니다. 확인해보세요!

[![HTTP Toolkit](https://avatars.githubusercontent.com/u/39777515?s=100)](https://github.com/httptoolkit)
[![OOMOL - Oomol AI Studio](https://avatars.githubusercontent.com/u/146153906?s=100)](https://oomol.com)

## 문서

### Docker

- docker.createContainer(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerCreate)
- docker.createImage([auth], options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ImageCreate)
- docker.loadImage(file, options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ImageLoad)
- docker.importImage(file, options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ImageCreate)
- docker.buildImage(file, options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ImageBuild)
- docker.checkAuth(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SystemAuth)
- docker.getContainer(id) - Container 객체 반환
- docker.getImage(name) - Image 객체 반환
- docker.getVolume(name) - Volume 객체 반환
- docker.getPlugin(name) - Plugin 객체 반환
- docker.getService(id) - Service 객체 반환
- docker.getTask(id) - Task 객체 반환
- docker.getNode(id) - Node 객체 반환
- docker.getNetwork(id) - Network 객체 반환
- docker.getSecret(id) - Secret 객체 반환
- docker.getConfig(id) - Config 객체 반환
- docker.getExec(id) - Exec 객체 반환
- docker.getPod(id) - Pod 객체 반환 (Podman 전용)
- docker.listContainers(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerList)
- docker.listImages(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ImageList)
- docker.listServices(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ServiceList)
- docker.listNodes(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/NodeList)
- docker.listTasks(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/TaskList)
- docker.listSecrets(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SecretList)
- docker.listConfigs(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ConfigList)
- docker.listPlugins(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/PluginList)
- docker.listVolumes(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/VolumeList)
- docker.listNetworks(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/NetworkList)
- docker.listPods(options) - Pod 목록 조회 (Podman 전용)
- docker.createPod(options) - Pod 생성 (Podman 전용)
- docker.getPod(id) - Pod 객체 가져오기 (Podman 전용)
- docker.prunePods(options) - 미사용 Pod 정리 (Podman 전용)
- docker.createSecret(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SecretCreate)
- docker.createConfig(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ConfigCreate)
- docker.createPlugin(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/PluginCreate)
- docker.createVolume(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/VolumeCreate)
- docker.createService(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ServiceCreate)
- docker.createNetwork(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/NetworkCreate)
- docker.pruneImages(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ImagePrune)
- docker.pruneBuilder() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/BuildPrune)
- docker.pruneContainers(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerPrune)
- docker.pruneVolumes(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/VolumePrune)
- docker.pruneNetworks(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/NetworkPrune)
- docker.searchImages(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ImageSearch)
- docker.info() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SystemInfo)
- docker.version() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SystemVersion)
- docker.ping() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SystemPing)
- docker.df() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SystemDataUsage)
- docker.getEvents(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SystemEvents)
- docker.swarmInit(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SwarmInit) ⚠️ Podman에서 미지원
- docker.swarmJoin(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SwarmJoin) ⚠️ Podman에서 미지원
- docker.swarmLeave(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SwarmLeave) ⚠️ Podman에서 미지원
- docker.swarmUpdate(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SwarmUpdate) ⚠️ Podman에서 미지원
- docker.swarmInspect() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SwarmInspect) ⚠️ Podman에서 미지원
- docker.pull(repoTag, options, callback, auth) - Docker CLI pull과 유사
- docker.pullAll(repoTag, options, callback, auth) - "-a" 옵션이 있는 Docker CLI pull과 유사
- docker.run(image, cmd, stream, createOptions, startOptions) - Docker CLI run과 유사

### Container

- container.inspect(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerInspect)
- container.rename(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerRename)
- container.update(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerUpdate)
- container.top(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerTop)
- container.changes() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerChanges)
- container.export() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerExport)
- container.start(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerStart)
- container.stop(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerStop)
- container.pause(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerPause)
- container.unpause(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerUnpause)
- container.exec(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerExec)
- container.commit(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ImageCommit)
- container.restart(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerRestart)
- container.kill(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerKill)
- container.resize(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerResize)
- container.attach(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerAttach)
- container.wait(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerWait)
- container.remove(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerDelete)
- container.getArchive(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerArchive)
- container.infoArchive(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerArchiveInfo)
- container.putArchive(file, options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/PutContainerArchive)
- container.logs(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerLogs)
- container.stats(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ContainerStats)

### Exec

- exec.start(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ExecStart)
- exec.resize(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ExecResize)
- exec.inspect() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ExecInspect)

### Image

- image.inspect(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.48/#tag/Image/operation/ImageInspect)
- image.history() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ImageHistory)
- image.push(options, callback, auth) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ImagePush)
- image.tag(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ImageTag)
- image.remove(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ImageDelete)
- image.get() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ImageGet)

### Network

- network.inspect() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/NetworkInspect)
- network.remove(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/NetworkDelete)
- network.connect(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/NetworkConnect)
- network.disconnect(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/NetworkDisconnect)

### Node

- node.inspect() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/NodeInspect)
- node.remove(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/NodeDelete)
- node.update(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/NodeUpdate)

### Plugin

- plugin.privileges() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/GetPluginPrivileges)
- plugin.pull(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/PluginPull)
- plugin.inspect() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/PluginInspect)
- plugin.remove(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/PluginDelete)
- plugin.enable(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/PluginEnable)
- plugin.disable(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/PluginDisable)
- plugin.update([auth], options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/PluginUpgrade)
- plugin.push(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/PluginPush)
- plugin.configure(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/PluginSet)

### Secret

- secret.inspect() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SecretInspect)
- secret.remove() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SecretDelete)
- secret.update(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/SecretUpdate)

### Service

- service.inspect() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ServiceInspect)
- service.remove(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ServiceDelete)
- service.update(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ServiceUpdate)
- service.logs(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/ServiceLogs)

### Task

- task.inspect() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/TaskInspect)
- task.logs(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/Session)

### Volume

- volume.inspect() - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/VolumeInspect)
- volume.remove(options) - [Docker API 엔드포인트](https://docs.docker.com/engine/api/v1.37/#operation/VolumeDelete)

### Pod (Podman 전용)

- pod.inspect(options) - Pod 구성 및 상태 조회
- pod.start(options) - Pod 시작
- pod.stop(options) - Pod 중지
- pod.restart(options) - Pod 재시작
- pod.pause(options) - Pod 일시정지
- pod.unpause(options) - Pod 재개
- pod.kill(options) - Pod 강제 종료
- pod.remove(options) - Pod 삭제
- pod.stats(options) - Pod 통계 조회
- pod.top(options) - Pod 내 실행 중인 프로세스 목록
- pod.exists(options) - Pod 존재 여부 확인

## 테스트

 * Docker용: 테스트를 위해 `docker pull ubuntu:latest`를 실행하여 시스템을 준비하세요.
 * Podman용: 테스트를 위해 `podman pull ubuntu:latest`를 실행하여 시스템을 준비하세요.
 * 테스트는 `mocha` 및 `chai`를 사용하여 구현되었습니다. `npm test`로 실행하세요.

## 예제

더 구체적인 사용 사례 예제는 examples 폴더를 확인하세요.

## 변경 내역

### dockerode에서 podmanode로 변경사항

#### 새로운 기능
1. **Podman 소켓 자동 감지**
   - Podman rootless 소켓 (`/run/user/{UID}/podman/podman.sock`) 우선 감지
   - Podman rootful 소켓 (`/run/podman/podman.sock`) 차선 감지
   - Docker 소켓 (`/var/run/docker.sock`)으로 폴백

2. **Pods 지원 (Podman 전용)**
   - 새로운 `Pod` 클래스 추가
   - `docker.createPod()` - Pod 생성
   - `docker.listPods()` - Pod 목록 조회
   - `docker.getPod()` - Pod 객체 가져오기
   - `docker.prunePods()` - 미사용 Pod 정리
   - Pod 라이프사이클 관리: start, stop, restart, pause, unpause, kill, remove
   - Pod 모니터링: inspect, stats, top, exists

3. **Swarm 제한사항 문서화**
   - Swarm 관련 메서드에 경고 추가
   - Podman에서 미지원 기능 명시

#### 호환성
- Docker API v1.40+ 호환
- 기존 dockerode 코드와 100% 호환
- Docker와 Podman 양쪽 모두 지원

## 라이선스

Pedro Dias - [@pedromdias](https://twitter.com/pedromdias)

Apache 라이선스 버전 2.0에 따라 라이선스가 부여됩니다. 라이선스를 준수하지 않으면 이 파일을 사용할 수 없습니다. 라이선스 사본은 다음에서 얻을 수 있습니다:

    http://www.apache.org/licenses/LICENSE-2.0.html

라이선스에 따라 작성된 소프트웨어는 명시적이든 묵시적이든 어떤 종류의 보증이나 조건 없이 "있는 그대로" 제공됩니다. 라이선스에 따른 권한 및 제한 사항은 라이선스를 참조하세요.
