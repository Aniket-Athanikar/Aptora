from dotenv import load_dotenv
import os
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

response = client.chat.completions.create(
    model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
    messages=[
        {
            "role": "user",
            "content": "Say hello!"
        }
    ]
)

print(response.choices[0].message.content)
