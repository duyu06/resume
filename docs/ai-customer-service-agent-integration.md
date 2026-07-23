# AI 客服数字人 Agent 接入说明

## 当前部署结构

- GitHub Pages：托管 `/resume/demos/digitalhuman/` 前端和无密钥演示模式。
- FastAPI：独立部署 AI 客服 Agent 服务。
- 模型提供商密钥：仅存在于 FastAPI 服务端环境变量中。

公开前端不得包含 OpenAI、OpenRouter、Groq 或其他模型提供商的 API Key。页面中的“网关访问令牌”仅用于访问自行部署的 API 网关，并保存在当前浏览器的 `sessionStorage`。

## Agent 接口

前端适配以下接口：

```text
GET    /health
POST   /chat
DELETE /conversation/{conversation_id}
GET    /performance
```

`POST /chat` 请求示例：

```json
{
  "message": "帮我查询订单 ORD-12345",
  "customer_id": "CUST-001",
  "conversation_id": "CONV-DEMO-001"
}
```

## 本地启动参考

```bash
git clone https://github.com/Bhavik-Jikadara/ai-customer-service-agent.git
cd ai-customer-service-agent
python -m venv .venv
source .venv/bin/activate
pip install -e .
export OPENAI_API_KEY="使用你本人申请的密钥"
uvicorn customer_service_agent.api:app --host 0.0.0.0 --port 8000
```

Windows PowerShell 使用：

```powershell
$env:OPENAI_API_KEY="使用你本人申请的密钥"
uvicorn customer_service_agent.api:app --host 0.0.0.0 --port 8000
```

## CORS

正式部署时，FastAPI 必须允许作品集域名访问：

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://duyu06.github.io"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-API-Key"],
)
```

不要使用 `allow_origins=["*"]` 与敏感凭据组合。生产环境还应增加速率限制、日志脱敏、请求体长度限制和网关鉴权。

## 无 Key 模式

未启用真实后端时，前端使用确定性的本地演示 Agent，支持：

- 订单与物流查询
- 库存核验
- 退款预申请
- 情绪分析
- 人工转接
- 工具调用轨迹
- 会话重置
- 性能报告

演示模式不会创建真实订单、退款或人工工单，也不会调用模型提供商 API。
