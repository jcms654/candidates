import { TestBed } from '@angular/core/testing';
import { IndexedDBService } from './indexed-db.service';
import { openDB, IDBPDatabase } from 'idb';
import { Candidate } from '../interfaces/candidate.interface';

// --- Mocks para 'idb' ---
// Definimos los mocks de los métodos de la DB aquí para fácil acceso y para poder espiarlos.
const mockDbMethods = {
  add: jest.fn((storeName, data) => Promise.resolve(1)),
  getAll: jest.fn(() => Promise.resolve([
    { id: 1, name: 'Juan Perez', email: 'juan@example.com' },
    { id: 2, name: 'Maria Lopez', email: 'maria@example.com' },
  ])),
  // Mock para el método upgrade
  objectStoreNames: {
    contains: jest.fn(() => false) // Por defecto, simula que no existe la store 'candidates'
  },
  createObjectStore: jest.fn() // Simula la creación del object store
};

jest.mock('idb', () => ({
  openDB: jest.fn(() => Promise.resolve(mockDbMethods)), // openDB siempre resuelve con nuestro objeto mockDbMethods
}));

describe('IndexedDBService', () => {
  let service: IndexedDBService;
  // No necesitamos mockDbInstance ya que mockDbMethods es global para el mock de idb

  // Antes de cada test, configuramos el módulo de Angular y obtenemos una instancia del servicio.
  beforeEach(async () => {
    // Limpiamos los mocks antes de cada test para asegurar un estado limpio
    // Esto es crucial para que los espías se reinicien.
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [IndexedDBService]
    });

    service = TestBed.inject(IndexedDBService);

    // No necesitamos esperar la promesa aquí con `await` porque el servicio ya está inicializado
    // y la promesa de openDB ya se habrá resuelto para cuando los tests llamen a los métodos.
  });

  // Test 1: El servicio debe ser creado correctamente.
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test 2: openDB debe ser llamado al inicializar el servicio y el upgrade debería crear la store
  it('should call openDB on initialization and create candidates store if it does not exist', async () => {
    // Verificamos que openDB fue llamado con los parámetros correctos.
    expect(openDB).toHaveBeenCalledWith(
      'CandidatesDB',
      1,
      expect.objectContaining({ // Usamos expect.objectContaining para verificar la estructura
        upgrade: expect.any(Function)
      })
    );

    // Accedemos al mock de la función upgrade que se pasa a openDB
    const upgradeFn = (openDB as jest.Mock).mock.calls[0][2].upgrade;

    // Creamos un mock de la base de datos específica para la función upgrade
    const dbMockForUpgrade = {
        objectStoreNames: { contains: jest.fn(() => false) }, // Simula que no existe la store
        createObjectStore: jest.fn()
    };

    // Llamamos a la función upgrade para simular su ejecución
    upgradeFn(dbMockForUpgrade);

    // Verificamos que 'contains' fue llamado y 'createObjectStore' fue llamado
    expect(dbMockForUpgrade.objectStoreNames.contains).toHaveBeenCalledWith('candidates');
    expect(dbMockForUpgrade.createObjectStore).toHaveBeenCalledWith('candidates', { autoIncrement: true });
  });

  // Test 3: saveCandidate debe llamar al método 'add' de la DB.
  it('should call add method on saveCandidate', async () => {
    const candidate: Candidate = { name: 'Carlos Gomez', email: 'carlos@example.com' };
    // Aquí espiamos directamente el mockDbMethods.add que es el que se usa en el openDB mock.
    const addSpy = jest.spyOn(mockDbMethods, 'add');

    await service.saveCandidate(candidate);

    // Verifica que 'add' fue llamado con el nombre de la store y el candidato.
    expect(addSpy).toHaveBeenCalledWith('candidates', candidate);
  });

  // Test 4: getAllCandidates debe llamar al método 'getAll' de la DB y retornar los candidatos.
  it('should call getAll method on getAllCandidates and return all candidates', async () => {
    // Aquí espiamos directamente el mockDbMethods.getAll
    const getAllSpy = jest.spyOn(mockDbMethods, 'getAll');

    const candidates = await service.getAllCandidates();

    // Verifica que 'getAll' fue llamado con el nombre de la store.
    expect(getAllSpy).toHaveBeenCalledWith('candidates');

    // Verifica que los candidatos retornados coinciden con los que definimos en nuestro mock.
    expect(candidates).toEqual([
      { id: 1, name: 'Juan Perez', email: 'juan@example.com' },
      { id: 2, name: 'Maria Lopez', email: 'maria@example.com' },
    ]);
  });
});