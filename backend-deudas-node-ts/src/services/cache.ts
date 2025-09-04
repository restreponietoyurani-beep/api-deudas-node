class CacheService {
    private cache: Map<string, { value: any; expiry: number | null }> = new Map();
  
    /**
     * Guardar un valor en cache
     * @param key clave de la cache
     * @param value valor a guardar
     * @param ttl tiempo de vida en segundos (opcional)
     */
    set(key: string, value: any, ttl?: number) {
      const expiry = ttl ? Date.now() + ttl * 1000 : null;
      this.cache.set(key, { value, expiry });
    }
  
    /**
     * Obtener un valor de la cache
     */
    get(key: string): any | null {
      const entry = this.cache.get(key);
      if (!entry) return null;
  
      if (entry.expiry && Date.now() > entry.expiry) {
        this.cache.delete(key); // caducado
        return null;
      }
  
      return entry.value;
    }
  
    /**
     * Eliminar un valor de la cache
     */
    delete(key: string) {
      this.cache.delete(key);
    }
  
    /**
     * Limpiar toda la cache
     */
    clear() {
      this.cache.clear();
    }
  }
  
  export const cacheService = new CacheService();