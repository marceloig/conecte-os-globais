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
for novela in novelas:
    novela_name = novela['novela']
    for elenco in novela['elenco']:
        ator = elenco['ator']
        personagem = elenco.get('personagem', '')
        print({
                'pk': f'NOVELA#{novela_name}',
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
                'pk': f'NOVELA#{novela_name}',
                'sk': ator,
                'novela': novela_name,
                'ator': ator,
                'personagem': personagem
            }
        )
        print("Novela imported successfully.")

        print({
                'pk': f'ATOR#{ator}',
                'sk': novela_name,
                'novela': novela_name,
                'ator': ator,
                'personagem': personagem
            })
        table.put_item(
            Item={
                'pk': f'ATOR#{ator}',
                'sk': novela_name,
                'novela': novela_name,
                'ator': ator,
                'personagem': personagem
            }
        )
        print("Ator imported successfully.")

print("Data imported successfully.")