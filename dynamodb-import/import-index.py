import boto3
import json

# Initialize a session using Amazon DynamoDB
session = boto3.Session(region_name='us-east-2')

# Initialize DynamoDB resource
dynamodb = session.resource('dynamodb')

# Specify the table
table = dynamodb.Table('conecte-os-globais')

# Load data from JSON file
with open('../scrapy/memoriaglobo/novelas.json') as json_file:
    novelas = json.load(json_file)

# Iterate through each novela and its elenco
index = 0
for novela in novelas:
    novela_name = novela['novela']
    for elenco in novela['elenco']:
        ator = elenco['ator']
        personagem = elenco.get('personagem', '')
        print({
                'pk': f'ATOR-INDEX#{index}',
                'sk': ator,
                'novela': novela_name,
                'ator': ator,
                'personagem': personagem
            })
        if not ator:
            print("Ator is empty, skip import.")
            continue
        table.put_item(
            Item={
                'pk': f'ATOR-INDEX#{index}',
                'sk': ator,
                'novela': novela_name,
                'ator': ator,
                'personagem': personagem
            }
        )
        index += 1
        print("Ator index imported successfully.")

print("Data imported successfully.")