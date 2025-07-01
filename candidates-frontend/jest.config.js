module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  //globalSetup: 'jest-preset-angular/global-setup', // Para Angular 15+ y problemas con Zone.js
  testEnvironment: 'jsdom', // Jest usa jsdom para simular un navegador
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    // Agrega más rutas si tienes aliases en tu tsconfig.json
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@angular|@ng-bootstrap|swiper)', // Ajusta si tienes otras libs con módulos ESM
  ],
  // Puedes añadir más configuraciones aquí, como colectores de cobertura
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
};