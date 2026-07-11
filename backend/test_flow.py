import asyncio
import httpx
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

async def main():
    async with httpx.AsyncClient(timeout=120.0) as client:
        print("1. Registering test user...")
        # Use a random email to avoid collisions on multiple runs
        import random
        email = f"test_{random.randint(1000, 9999)}@example.com"
        r = await client.post(f"{BASE_URL}/auth/register", json={"email": email, "password": "password123"})
        
        print("2. Logging in...")
        r = await client.post(f"{BASE_URL}/auth/login", json={"email": email, "password": "password123"})
        token = r.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        print("\n3. Describing brand to AI...")
        description = "a brand for sell high quality cars acessoire"
        r = await client.post(f"{BASE_URL}/brands/describe", json={"description": description}, headers=headers)
        
        if r.status_code != 200:
            print("Error describing brand:", r.text)
            return
            
        suggestions = r.json()
        print("\n--- AI Brand Suggestions ---")
        print(json.dumps(suggestions, indent=2))
        
        print("\n4. Confirming and saving brand...")
        confirm_payload = {
            "name": "AutoElite Accessories", # Giving it a mock name
            "description": description,
            "mission": suggestions["mission"],
            "industry": suggestions["industry"],
            "target_audience": suggestions["target_audience"],
            "brand_tone": suggestions["brand_tone"],
            "competitors": suggestions["suggested_competitors"]
        }
        r = await client.post(f"{BASE_URL}/brands/confirm", json=confirm_payload, headers=headers)
        brand_data = r.json()
        brand_id = brand_data["id"]
        print(f"Brand saved with ID: {brand_id}")
        
        print("\n5. Running deep market analysis (this will take 10-20 seconds to do web searches)...")
        r = await client.post(f"{BASE_URL}/responses/analyze/{brand_id}", headers=headers)
        
        if r.status_code != 200:
            print("Error generating report:", r.text)
            return
            
        report = r.json()
        print("\n" + "="*50)
        print("FINAL MARKET REPORT:")
        print("="*50)
        print(f"Health Score: {report.get('health_score')}/10\n")
        print(f"Executive Summary:\n{report.get('executive_summary')}\n")
        print(f"Market Trends:\n{report.get('market_trends')}\n")
        
        print("Opportunities:")
        for opp in report.get("opportunities", []):
            print(f"- {opp}")
            
        print("\nThreats:")
        for threat in report.get("threats", []):
            print(f"- {threat}")
            
        print("\nRecommendations:")
        for rec in report.get("recommendations", []):
            print(f"- {rec}")
            
        print("\nCompetitor Map:")
        for comp in report.get("competitor_map", []):
            print(f"- {comp.get('name')}: {comp.get('summary')}")

if __name__ == "__main__":
    asyncio.run(main())
