import os
import httpx
from typing import Optional, List, Dict, Any
from fastapi import HTTPException
import asyncio


class TMDBService:
    """
    Serviço para integração com a API do TMDB (The Movie Database)
    
    Documentação da API: https://developers.themoviedb.org/3
    """
    
    def __init__(self):
        self.api_token = os.getenv("TMDB_API_TOKEN")
        if not self.api_token:
            raise ValueError("TMDB_API_TOKEN environment variable is required")
        
        self.base_url = "https://api.themoviedb.org/3"
        self.image_base_url = "https://image.tmdb.org/t/p"
        
        # Headers padrão para autenticação
        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
    
    async def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Método privado para fazer requisições HTTP à API do TMDB
        
        Args:
            endpoint: Endpoint da API (ex: "/search/movie")
            params: Parâmetros da query string
            
        Returns:
            Dict com a resposta da API
            
        Raises:
            HTTPException: Em caso de erro na requisição
        """
        url = f"{self.base_url}{endpoint}"
        
        # Parâmetros padrão
        default_params = {"language": "pt-BR"}
        if params:
            default_params.update(params)
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url, 
                    headers=self.headers, 
                    params=default_params,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
                
            except httpx.TimeoutException:
                raise HTTPException(status_code=504, detail="Timeout na requisição para TMDB API")
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 401:
                    raise HTTPException(status_code=401, detail="Token de acesso TMDB inválido")
                elif e.response.status_code == 404:
                    raise HTTPException(status_code=404, detail="Recurso não encontrado na TMDB API")
                else:
                    raise HTTPException(
                        status_code=e.response.status_code,
                        detail=f"Erro na TMDB API: {e.response.status_code}"
                    )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    
    async def search_movies(self, query: str, page: int = 1) -> Dict[str, Any]:
        """
        Busca filmes por nome
        
        Args:
            query: Termo de busca
            page: Página dos resultados (padrão: 1)
            
        Returns:
            Dict com resultados da busca
        """
        endpoint = "/search/movie"
        params = {"query": query, "page": page}
        return await self._make_request(endpoint, params)
    
    async def search_tv_shows(self, query: str, page: int = 1) -> Dict[str, Any]:
        """
        Busca séries/novelas por nome
        
        Args:
            query: Termo de busca
            page: Página dos resultados (padrão: 1)
            
        Returns:
            Dict com resultados da busca
        """
        endpoint = "/search/tv"
        params = {"query": query, "page": page}
        response = await self._make_request(endpoint, params)

        if response['results']:
            result = max(response['results'], key=lambda item: item["popularity"])
            return result
        return {}
    
    async def search_person(self, query: str, page: int = 1) -> Dict[str, Any]:
        """
        Busca pessoas (atores, diretores, etc.) por nome
        
        Args:
            query: Termo de busca
            page: Página dos resultados (padrão: 1)
            
        Returns:
            Dict com resultados da busca
        """
        endpoint = "/search/person"
        params = {"query": query, "page": page}
        response = await self._make_request(endpoint, params)

        if response['results']:
            return response['results'][0]
        return {}
    
    async def get_movie_details(self, movie_id: int) -> Dict[str, Any]:
        """
        Obtém detalhes completos de um filme
        
        Args:
            movie_id: ID do filme no TMDB
            
        Returns:
            Dict com detalhes do filme
        """
        endpoint = f"/movie/{movie_id}"
        params = {"append_to_response": "credits,videos,similar"}
        return await self._make_request(endpoint, params)
    
    async def get_tv_details(self, tv_id: int) -> Dict[str, Any]:
        """
        Obtém detalhes completos de uma série/novela
        
        Args:
            tv_id: ID da série no TMDB
            
        Returns:
            Dict com detalhes da série
        """
        endpoint = f"/tv/{tv_id}"
        params = {"append_to_response": "credits,videos,similar"}
        return await self._make_request(endpoint, params)
    
    async def get_person_details(self, person_id: int) -> Dict[str, Any]:
        """
        Obtém detalhes completos de uma pessoa (ator, diretor, etc.)
        
        Args:
            person_id: ID da pessoa no TMDB
            
        Returns:
            Dict com detalhes da pessoa
        """
        endpoint = f"/person/{person_id}"
        params = {"append_to_response": "movie_credits,tv_credits"}
        return await self._make_request(endpoint, params)
    
    async def get_popular_movies(self, page: int = 1) -> Dict[str, Any]:
        """
        Obtém filmes populares
        
        Args:
            page: Página dos resultados (padrão: 1)
            
        Returns:
            Dict com filmes populares
        """
        endpoint = "/movie/popular"
        params = {"page": page}
        return await self._make_request(endpoint, params)
    
    async def get_popular_tv_shows(self, page: int = 1) -> Dict[str, Any]:
        """
        Obtém séries populares
        
        Args:
            page: Página dos resultados (padrão: 1)
            
        Returns:
            Dict com séries populares
        """
        endpoint = "/tv/popular"
        params = {"page": page}
        return await self._make_request(endpoint, params)
    
    async def get_trending(self, media_type: str = "all", time_window: str = "day") -> Dict[str, Any]:
        """
        Obtém conteúdo em tendência
        
        Args:
            media_type: Tipo de mídia ("movie", "tv", "person", "all")
            time_window: Janela de tempo ("day", "week")
            
        Returns:
            Dict com conteúdo em tendência
        """
        endpoint = f"/trending/{media_type}/{time_window}"
        return await self._make_request(endpoint)
    
    def get_image_url(self, image_path: Optional[str], size: str = "w500") -> Optional[str]:
        """
        Constrói URL completa para imagens do TMDB
        
        Args:
            image_path: Caminho da imagem retornado pela API
            size: Tamanho da imagem (w92, w154, w185, w342, w500, w780, original)
            
        Returns:
            URL completa da imagem ou None se image_path for None
        """
        if not image_path:
            return None
        return f"{self.image_base_url}/{size}{image_path}"
    
    async def get_movie_credits(self, movie_id: int) -> Dict[str, Any]:
        """
        Obtém créditos (elenco e equipe) de um filme
        
        Args:
            movie_id: ID do filme no TMDB
            
        Returns:
            Dict com créditos do filme
        """
        endpoint = f"/movie/{movie_id}/credits"
        return await self._make_request(endpoint)
    
    async def get_tv_credits(self, tv_id: int) -> Dict[str, Any]:
        """
        Obtém créditos (elenco e equipe) de uma série
        
        Args:
            tv_id: ID da série no TMDB
            
        Returns:
            Dict com créditos da série
        """
        endpoint = f"/tv/{tv_id}/credits"
        return await self._make_request(endpoint, params)
    
    async def discover_movies(self, **filters) -> Dict[str, Any]:
        """
        Descobre filmes com filtros específicos
        
        Args:
            **filters: Filtros como genre_ids, year, sort_by, etc.
            
        Returns:
            Dict com filmes descobertos
        """
        endpoint = "/discover/movie"
        return await self._make_request(endpoint, filters)
    
    async def discover_tv_shows(self, **filters) -> Dict[str, Any]:
        """
        Descobre séries com filtros específicos
        
        Args:
            **filters: Filtros como genre_ids, first_air_date_year, sort_by, etc.
            
        Returns:
            Dict com séries descobertas
        """
        endpoint = "/discover/tv"
        return await self._make_request(endpoint, filters)
