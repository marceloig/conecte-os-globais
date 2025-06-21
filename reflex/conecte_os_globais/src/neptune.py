import requests
import os
import logging

# AWS Neptune endpoint and port
NEPTUNE_ENDPOINT = os.getenv("NEPTUNE_ENDPOINT", "localhost")
NEPTUNE_PORT = os.getenv("NEPTUNE_PORT", 7777)
NEPTUNE_URL = f"https://{NEPTUNE_ENDPOINT}:{NEPTUNE_PORT}/openCypher"

logger = logging.getLogger(__name__)

class NeptuneRepository:

    def __init__(self):
        # Test connection to Neptune
        try:
            response = requests.get(NEPTUNE_URL)
            if response.status_code == 200 or response.status_code == 400:
                print("Connection to Neptune successful!")
            else:
                print(f"Failed to connect to Neptune: {response.status_code}")
        except Exception as e:
            logger.error("Error connecting to Neptune: %s", e)
            raise e

    def run_query(self, query: str, params: dict = None) -> list[dict]:
        payload = {"query": query}
        if params:
            payload["parameters"] = params
        headers = {"Content-Type": "application/json"}
        try:
            response = requests.post(NEPTUNE_URL, json=payload, headers=headers)
            response.raise_for_status()
            return response.json().get("results", [])
        except requests.exceptions.RequestException as e:
            logger.error("Query failed: %s", e)
            return []

    def get_all_contains_novelas(self, novela: str) -> list[str]:
        query = """
                MATCH (n:Novela)
                WHERE n.novela CONTAINS $novela
                RETURN n.novela AS novela
                """
        results = self.run_query(query, {"novela": novela})
        return [record["novela"] for record in results]

    def get_all_contains_atores(self, ator: str) -> list[str]:
        query = """
                MATCH (a:Ator)
                WHERE a.ator CONTAINS $ator
                RETURN a.ator AS ator
                """
        results = self.run_query(query, {"ator": ator})
        return [record["ator"] for record in results]

    def get_random_atores(self) -> str:
        query = """
                MATCH (a:Ator)
                RETURN a.ator AS nome
                ORDER BY rand()
                LIMIT 1
                """
        results = self.run_query(query)
        return results[0]["nome"] if results else None

    def find_records_by_atores(self, atores: list[str]) -> list[dict]:
        query = """
                MATCH (n:Novela)-[:atuacao]->(a:Ator)
                WHERE a.ator IN $atores
                RETURN n.novela AS novela, a.ator AS ator
                """
        results = self.run_query(query, {"atores": atores})
        return [{"novela": record["novela"], "ator": record["ator"]} for record in results]

    def find_records_by_novelas(self, novelas: list[str]) -> list[dict]:
        query = """
                MATCH (n:Novela)-[:atuacao]->(a:Ator)
                WHERE n.novela IN $novelas
                RETURN a.ator AS ator, n.novela AS novela
                """
        results = self.run_query(query, {"novelas": novelas})
        return [{"novela": record["novela"], "ator": record["ator"]} for record in results]