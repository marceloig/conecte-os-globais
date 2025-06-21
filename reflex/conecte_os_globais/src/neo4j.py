from neo4j import GraphDatabase
from neo4j import Driver
from os import getenv

# URI examples: "neo4j://localhost", "neo4j+s://xxx.databases.neo4j.io"
URI = getenv("NEO4J_URI", "neo4j://localhost:56789")
AUTH = ("neo4j", "0zHaB^P01*#@gRv8")



class Neo4jRepository:

    driver = Driver

    def __init__(self):
        self.driver = GraphDatabase.driver(URI, auth=AUTH)
        self.driver.verify_connectivity()
        print("Connection successful!")

    def get_all_contains_novelas(self, novela: str) -> list[str]:
        query = """
                MATCH (n:Novela)
                WHERE n.novela CONTAINS $novela
                RETURN n.novela AS novela
                """
        with self.driver.session() as session:
            result = session.run(
                query,
                novela=novela
            )
            return [record["novela"] for record in result]
    
    def get_all_contains_atores(self, ator: str) -> list[str]:
        query = """
                MATCH (a:Ator)
                WHERE a.ator CONTAINS $ator
                RETURN a.ator AS ator
                """
        with self.driver.session() as session:
            result = session.run(
                query,
                ator=ator
            )
            return [record["ator"] for record in result]
        
    def get_random_atores(self) -> str:
        query = """
                MATCH (a:Ator)
                RETURN a.ator AS nome
                ORDER BY rand()
                LIMIT 1
                """
        with self.driver.session() as session:
            result = session.run(query)
            return result.single()["nome"]
        
    def find_records_by_atores(self, atores: list[str]) -> list[str]:
        query = """
                MATCH (n:Novela)-[:atuacao]->(a:Ator)
                WHERE a.ator IN $atores
                RETURN n.novela AS novela, a.ator AS ator
                """
        with self.driver.session() as session:
            result = session.run(
                query,
                atores=atores
            )
            return [{"novela": record["novela"], "ator": record["ator"]} for record in result]
    
    def find_records_by_novelas(self, novelas: list[str]) -> list[str]:
        query = """
                MATCH (n:Novela)-[:atuacao]->(a:Ator)
                WHERE n.novela IN $novelas
                RETURN a.ator AS ator, n.novela AS novela
                """
        with self.driver.session() as session:
            result = session.run(
                query,
                novelas=novelas
            )
            return [{"novela": record["novela"], "ator": record["ator"]} for record in result]