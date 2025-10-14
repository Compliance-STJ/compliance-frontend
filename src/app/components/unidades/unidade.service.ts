import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Unidade, UnidadeEstatisticas } from './unidade.model';
import { environment } from '../../../environments/environment';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UnidadeService {
  private apiUrl = environment.apiUrl;
  private readonly baseUrl = 'http://localhost:8080/api/unidades';
  private mockUnidades: Unidade[] = [];
  private nextId = 1;
  private useMockData = false; // Configurado para usar API real

  constructor(private http: HttpClient) {
    // Inicializa os dados simulados
    this.mockUnidades = this.criarDadosSimulados();
  }

  /**
   * Cria dados simulados para desenvolvimento
   */
  private criarDadosSimulados(): Unidade[] {
    return [
      { id: this.nextId++, nome: 'Assessoria de Compliance e Riscos', sigla: 'ACR', descricao: 'Responsável pela gestão de compliance e riscos do STJ', ativo: true, responsavel: 'João Silva', email: 'acr@stj.jus.br', telefone: '(61) 3319-8000', dataCriacao: new Date().toISOString() },
      { id: this.nextId++, nome: 'Secretaria de Tecnologia da Informação', sigla: 'STI', descricao: 'Responsável pela infraestrutura e sistemas de TI', ativo: true, responsavel: 'Maria Souza', email: 'sti@stj.jus.br', telefone: '(61) 3319-8100', dataCriacao: new Date().toISOString() },
      { id: this.nextId++, nome: 'Secretaria de Gestão de Pessoas', sigla: 'SGP', descricao: 'Responsável pela gestão de recursos humanos', ativo: true, responsavel: 'Carlos Santos', email: 'sgp@stj.jus.br', telefone: '(61) 3319-8200', dataCriacao: new Date().toISOString() },
      { id: this.nextId++, nome: 'Secretaria Judiciária', sigla: 'SJD', descricao: 'Responsável pelo processamento judicial', ativo: true, responsavel: 'Ana Oliveira', email: 'sjd@stj.jus.br', telefone: '(61) 3319-8300', dataCriacao: new Date().toISOString() },
      { id: this.nextId++, nome: 'Secretaria de Administração', sigla: 'SAD', descricao: 'Responsável pela gestão administrativa', ativo: true, responsavel: 'Roberto Lima', email: 'sad@stj.jus.br', telefone: '(61) 3319-8400', dataCriacao: new Date().toISOString() },
      { id: this.nextId++, nome: 'Secretaria de Orçamento e Finanças', sigla: 'SOF', descricao: 'Responsável pela gestão orçamentária e financeira', ativo: true, responsavel: 'Carla Mendes', email: 'sof@stj.jus.br', telefone: '(61) 3319-8500', dataCriacao: new Date().toISOString() },
      { id: this.nextId++, nome: 'Secretaria de Segurança', sigla: 'SSE', descricao: 'Responsável pela segurança institucional', ativo: true, responsavel: 'Paulo Ribeiro', email: 'sse@stj.jus.br', telefone: '(61) 3319-8600', dataCriacao: new Date().toISOString() },
      { id: this.nextId++, nome: 'Assessoria de Comunicação', sigla: 'ACO', descricao: 'Responsável pela comunicação institucional', ativo: true, responsavel: 'Fernanda Costa', email: 'aco@stj.jus.br', telefone: '(61) 3319-8700', dataCriacao: new Date().toISOString() },
      { id: this.nextId++, nome: 'Conselho Nacional de Justiça', sigla: 'CNJ', descricao: 'Órgão de controle do Poder Judiciário', ativo: true, responsavel: 'Marcos Andrade', email: 'contato@cnj.jus.br', telefone: '(61) 2326-5000', dataCriacao: new Date().toISOString() },
      { id: this.nextId++, nome: 'Tribunal de Contas da União', sigla: 'TCU', descricao: 'Órgão de controle externo', ativo: false, responsavel: 'Antônio Ferreira', email: 'contato@tcu.gov.br', telefone: '(61) 3316-7000', dataCriacao: new Date().toISOString() },
    ];
  }

  /**
   * Lista todas as unidades
   */
  listarTodas(): Observable<Unidade[]> {
    if (this.useMockData) {
      return of([...this.mockUnidades]).pipe(delay(300));
    }
    return this.http.get<Unidade[]>(this.baseUrl);
  }

  /**
   * Lista apenas as unidades ativas
   */
  listarAtivas(): Observable<Unidade[]> {
    if (this.useMockData) {
      const ativas = this.mockUnidades.filter(u => u.ativo);
      return of([...ativas]).pipe(delay(300));
    }
    return this.http.get<Unidade[]>(`${this.baseUrl}/ativas`);
  }

  /**
   * Busca unidade por ID
   */
  buscarPorId(id: number): Observable<Unidade> {
    if (this.useMockData) {
      const unidade = this.mockUnidades.find(u => u.id === id);
      if (unidade) {
        return of({...unidade}).pipe(delay(300));
      }
      return of({} as Unidade).pipe(delay(300));
    }
    return this.http.get<Unidade>(`${this.baseUrl}/${id}`);
  }

  /**
   * Busca unidades por nome ou sigla
   */
  buscarPorNomeSigla(termo: string): Observable<Unidade[]> {
    if (this.useMockData) {
      const filtradas = this.mockUnidades.filter(u => 
        u.nome.toLowerCase().includes(termo.toLowerCase()) || 
        u.sigla.toLowerCase().includes(termo.toLowerCase())
      );
      return of([...filtradas]).pipe(delay(300));
    }
    const params = new HttpParams().set('termo', termo);
    return this.http.get<Unidade[]>(`${this.baseUrl}/buscar`, { params });
  }

  /**
   * Cria uma nova unidade
   */
  criar(unidade: Unidade): Observable<Unidade> {
    if (this.useMockData) {
      const novaUnidade = {
        ...unidade,
        id: this.nextId++,
        dataCriacao: new Date().toISOString()
      };
      this.mockUnidades.push(novaUnidade);
      return of({...novaUnidade}).pipe(delay(500));
    }
    return this.http.post<Unidade>(this.baseUrl, unidade);
  }

  /**
   * Atualiza uma unidade existente
   */
  atualizar(id: number, unidade: Unidade): Observable<Unidade> {
    if (this.useMockData) {
      const index = this.mockUnidades.findIndex(u => u.id === id);
      if (index !== -1) {
        const unidadeAtualizada = {
          ...unidade,
          id: id,
          dataAtualizacao: new Date().toISOString()
        };
        this.mockUnidades[index] = unidadeAtualizada;
        return of({...unidadeAtualizada}).pipe(delay(500));
      }
      return of({} as Unidade).pipe(delay(300));
    }
    return this.http.put<Unidade>(`${this.baseUrl}/${id}`, unidade);
  }

  /**
   * Ativa uma unidade
   */
  ativar(id: number): Observable<Unidade> {
    if (this.useMockData) {
      const index = this.mockUnidades.findIndex(u => u.id === id);
      if (index !== -1) {
        this.mockUnidades[index].ativo = true;
        this.mockUnidades[index].dataAtualizacao = new Date().toISOString();
        return of({...this.mockUnidades[index]}).pipe(delay(500));
      }
      return of({} as Unidade).pipe(delay(300));
    }
    return this.http.patch<Unidade>(`${this.baseUrl}/${id}/ativar`, {});
  }

  /**
   * Inativa uma unidade
   */
  inativar(id: number): Observable<Unidade> {
    if (this.useMockData) {
      const index = this.mockUnidades.findIndex(u => u.id === id);
      if (index !== -1) {
        this.mockUnidades[index].ativo = false;
        this.mockUnidades[index].dataAtualizacao = new Date().toISOString();
        return of({...this.mockUnidades[index]}).pipe(delay(500));
      }
      return of({} as Unidade).pipe(delay(300));
    }
    return this.http.patch<Unidade>(`${this.baseUrl}/${id}/inativar`, {});
  }

  /**
   * Remove uma unidade (inativação lógica)
   */
  remover(id: number): Observable<void> {
    if (this.useMockData) {
      const index = this.mockUnidades.findIndex(u => u.id === id);
      if (index !== -1) {
        this.mockUnidades.splice(index, 1);
      }
      return of(void 0).pipe(delay(500));
    }
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtém estatísticas das unidades
   */
  obterEstatisticas(): Observable<UnidadeEstatisticas> {
    if (this.useMockData) {
      const ativas = this.mockUnidades.filter(u => u.ativo).length;
      const inativas = this.mockUnidades.length - ativas;
      
      const estatisticas = {
        total: this.mockUnidades.length,
        ativas: ativas,
        inativas: inativas
      };
      
      return of(estatisticas).pipe(delay(300));
    }
    return this.http.get<UnidadeEstatisticas>(`${this.baseUrl}/estatisticas`);
  }
}