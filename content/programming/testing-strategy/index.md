+++
title = "Testing strategy"
date = 2026-04-12
description = "A practical overview of unit, smoke, integration, and functional testing"
draft = false

[taxonomies]
tags = ["testing", "programming"]

[extra]
show_toc = true
show_copyright = false
show_comments = true
show_shares = false
keywords = "testing,unit test,smoke test,integration test,functional test,programming"
+++

This document summarizes four key testing strategies and then applies them to the Browser WebSocket SDK as a concrete example.

{{ show_image(path="res/1-overview.png", caption="Testing strategies", width=100) }}

Shortcut: [Open diagram](res/0412-testing_strategies.drawio)

## 1. Theoretical concepts about four testing strategies

| Strategy | Primary purpose |
| :--- | :--- |
| **Unit Test** | Verify internal logic of isolated functions such as parsing, formatting, and state management. |
| **Smoke Test** | Quick check to see whether the lights are on and basic connectivity exists. |
| **Integration Test** | Verify the handshake and data flow between the SDK and the server interfaces. |
| **Functional Test** | Validate that a complete user requirement is met end-to-end in a real environment. |

#### Unit testing: the logic inspector

Unit testing focuses on the smallest testable parts of a system in isolation. It checks whether a function, method, or small module behaves correctly for expected inputs, edge cases, and failure cases without involving external dependencies such as a server, browser runtime, database, or network connection.

#### Smoke testing: the pulse check

Smoke testing is a fast confidence check that verifies the system is alive enough for deeper validation. Its goal is not broad coverage. Its goal is to detect obvious startup, deployment, or connectivity failures early so the pipeline can stop before running more expensive tests.

#### Integration testing: the handshake

Integration testing checks whether separate components work together correctly through their real interfaces. It focuses on contracts such as message formats, response behavior, state transitions, and transport rules between modules or services.

#### Functional testing: the user journey

Functional testing validates complete requirements from the perspective of system behavior. It checks whether real workflows produce the expected outcomes in an environment that is close to production, even if multiple subsystems must cooperate to satisfy the requirement.

## 2. Browser WebSocket SDK in practice

### 2.1. Context of Browser WebSocket SDK

The **Browser WebSocket SDK** is used here as a practical example for applying the four testing strategies.

- **Purpose:** Act as the communication layer between user interactions in the browser and the backend system.
- **Specification:** Use **WebSocket** as the primary communication channel.

In practice, the SDK is responsible for maintaining persistent bidirectional connections, serializing and deserializing JSON payloads, capturing browser-side events, and keeping client and server state synchronized across reconnects.

### 2.2. How each testing strategy tests what

#### Unit testing: the logic inspector

- **What it tests:** Internal logic inside the SDK without relying on a real WebSocket server or a full browser-to-backend flow.
- **What should be validated:** Message serialization, payload parsing, local state transitions, retry counters, reconnection decisions, and helper functions that transform internal data.
- **SDK example:** Test the `format_message()` function and verify that `send_event()` calls the socket correctly while using a mocked WebSocket object instead of a real network connection.
- **Why this matters:** If this layer is wrong, every higher-level test may fail for reasons unrelated to the server or the network.

```python
import json
import pytest
from unittest.mock import MagicMock


class WebSocketClient:
    def __init__(self, url):
        self.url = url
        self.ws = None

    def format_message(self, event_type, data):
        return json.dumps({"type": event_type, "payload": data})

    def send_event(self, event_type, data):
        payload = self.format_message(event_type, data)
        if self.ws:
            self.ws.send(payload)


def test_message_formatting_logic():
    client = WebSocketClient("ws://localhost:8080")

    result = client.format_message("click", {"id": "btn_1"})

    expected = json.dumps({"type": "click", "payload": {"id": "btn_1"}})
    assert result == expected


def test_send_event_calls_socket():
    mock_ws = MagicMock()
    client = WebSocketClient("ws://localhost:8080")
    client.ws = mock_ws

    client.send_event("login", {"user": "tester"})

    mock_ws.send.assert_called_once()
```

#### Smoke testing: the pulse check

- **What it tests:** Whether the SDK can start, load core configuration, and establish a minimal usable connection path.
- **What should be validated:** Successful SDK initialization, basic connection startup, ability to reach the configured WebSocket endpoint, and absence of immediate crashes or fatal misconfiguration.
- **SDK example:** Run a minimal startup check that initializes the client and attempts to open a WebSocket connection. If startup fails or the endpoint is unreachable, the build should fail immediately.
- **Why this matters:** It acts as a gatekeeper and prevents wasting time and CI resources on deeper tests when the build is already broken.

```python
import pytest
import websockets


class WebSocketClient:
    def __init__(self, url):
        self.url = url

    async def connect(self):
        return await websockets.connect(self.url)


@pytest.mark.asyncio
async def test_sdk_starts_and_connects():
    client = WebSocketClient("ws://localhost:8001")

    connection = await client.connect()

    assert connection.open is True
    await connection.close()
```

#### Integration testing: the handshake

- **What it tests:** The contract between the Browser WebSocket SDK and the backend through their real communication boundary.
- **What should be validated:** Connection handshake frames, JSON schema compatibility, acknowledgement behavior, event delivery, reconnection recovery, and server responses to SDK-generated messages.
- **SDK example:** Start a local WebSocket server and verify that when the SDK sends a subscription message, the server returns the expected acknowledgement payload and session ID.
- **Why this matters:** Both sides may be individually correct while still failing together because of mismatched protocol assumptions.

```python
import asyncio
import pytest
import websockets
import json


async def sdk_connect_and_subscribe(url):
    async with websockets.connect(url) as websocket:
        await websocket.send(json.dumps({"action": "subscribe"}))
        response = await websocket.recv()
        return json.loads(response)


@pytest.mark.asyncio
async def test_server_handshake_contract():
    async def mock_server(websocket):
        msg = await websocket.recv()
        data = json.loads(msg)
        if data.get("action") == "subscribe":
            await websocket.send(
                json.dumps({"status": "subscribed", "session_id": "123"})
            )

    async with websockets.serve(mock_server, "localhost", 8001):
        result = await sdk_connect_and_subscribe("ws://localhost:8001")

        assert result["status"] == "subscribed"
        assert "session_id" in result
```

#### Functional testing: the user journey

- **What it tests:** Real user-facing behavior across the full path from browser interaction to backend result.
- **What should be validated:** User-triggered event capture, message transmission through WebSocket, backend persistence, and final system behavior that satisfies a business requirement.
- **SDK example:** Use Playwright to launch a real browser, trigger a UI click, and verify that the SDK opens a WebSocket session and carries the user interaction through the end-to-end path.
- **Why this matters:** It confirms that the system delivers the intended business outcome, not just technically correct intermediate steps.

```python
from playwright.sync_api import sync_playwright
import pytest


def test_user_click_transmission_functional():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:3000/test-page")

        with page.expect_websocket() as ws_info:
            page.click("#track-me-button")
            ws = ws_info.value

            def is_click_event(payload):
                return "track-me-button" in payload

            assert ws.is_closed() is False

        browser.close()
```

## 3. Execution order in CI/CD

In a professional pipeline, tests are executed from the **fastest and cheapest** to the **slowest and most expensive**:

1. **Unit Tests:** Run in milliseconds. Finds bugs in internal code logic.
2. **Smoke Tests:** Run in seconds. Acts as the **Gatekeeper**. Finds deployment or critical connectivity errors.
3. **Integration Tests:** Run in seconds. Finds communication errors between the SDK and the server.
4. **Functional Tests:** Run in minutes. Finds errors in the actual user experience and high-level requirements.

This ordering keeps feedback fast while still protecting the full user experience before release.
