# conecte-os-globais
Conecte os Globais

## Abrir conexão local com o Neo4j

*OBS:* Verificar se as credencials AWS estão corretas e respondendo antes de executar o comando

```
aws ssm start-session \
    --target i-0bf0bc2cd8a9f008b \
    --document-name AWS-StartPortForwardingSession \
    --parameters '{"portNumber":["7687"], "localPortNumber":["56789"]}'
```