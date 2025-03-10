from neo4j import GraphDatabase
from neo4j import Driver

# URI examples: "neo4j://localhost", "neo4j+s://xxx.databases.neo4j.io"
URI = "neo4j+ssc://bab2e0c4.databases.neo4j.io"
AUTH = ("neo4j", "ZBNHkZ7wbfol4-ECsjGX2YQHAp0pz1qZNRmg3Oym0wo")



class Neo4jRepository:

    driver = Driver

    def __init__(self):
        self.driver = GraphDatabase.driver(URI, auth=AUTH)
        self.driver.verify_connectivity()
        print("Connection successful!")

    def get_all_contains_novelas(self, novela: str):
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