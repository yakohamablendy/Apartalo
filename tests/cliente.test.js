// tests/cliente.test.js

const { Builder, By, until } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');

jest.setTimeout(180000);

describe('Flujo Completo del Cliente', () => {
    let driver;

    beforeAll(async () => {
        console.log('[Cliente Test] - Iniciando el hook beforeAll...');

        // El modo headless está comentado para que puedas ver el navegador.
        const chromeOptions = new Options()
            // .addArguments('--headless') // <--- LÍNEA MODIFICADA
            .addArguments('--disable-gpu')
            .addArguments('--window-size=1920,1080');

        try {
            console.log('[Cliente Test] - Construyendo el driver de Chrome...');
            driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
            console.log('[Cliente Test] - Driver construido exitosamente.');
        } catch (error) {
            console.error('[Cliente Test] - Error al construir el driver:', error);
            throw error;
        }
    });

    afterAll(async () => {
        console.log('[Cliente Test] - Iniciando el hook afterAll...');
        if (driver) {
            await driver.quit();
            console.log('[Cliente Test] - Driver cerrado exitosamente.');
        }
    });

    test(' El flujo completo de login, crear, ver y cancelar reserva debe funcionar', async () => {
        await driver.get('http://localhost:3000/pages/login.html');
        await driver.findElement(By.id('email')).sendKeys('samuelcs12@gmail.com');
        await driver.findElement(By.id('password')).sendKeys('123456789');
        await driver.findElement(By.id('login-btn')).click();
        await driver.wait(until.urlContains('/historial.html'), 20000);
        
        await driver.get('http://localhost:3000/pages/reservas.html');
        await driver.findElement(By.id('fechaReserva')).sendKeys('2025-11-20');
        await driver.findElement(By.id('numeroPersonas')).sendKeys('2');
        const primerHorario = await driver.wait(until.elementLocated(By.css('#timeSlots .time-slot')), 20000);
        await driver.executeScript("arguments[0].scrollIntoView(true);", primerHorario);
        await driver.executeScript("arguments[0].click();", primerHorario);
        const nextToTablesButton = await driver.findElement(By.id('nextToTables'));
        await driver.executeScript("arguments[0].click();", nextToTablesButton);
        const mesaDisponible = await driver.wait(until.elementLocated(By.css('#mesasContainer .mesa-card')), 20000);
        await driver.executeScript("arguments[0].click();", mesaDisponible);
        const nextToFormButton = await driver.findElement(By.id('nextToForm'));
        await driver.executeScript("arguments[0].click();", nextToFormButton);
        const btnConfirmarReserva = await driver.wait(until.elementIsVisible(driver.findElement(By.id('confirmarReserva'))), 20000);
        await driver.executeScript("arguments[0].click();", btnConfirmarReserva);
        await driver.wait(until.urlContains('/historial.html'), 20000);

        const botonCancelar = await driver.wait(until.elementLocated(By.css('.btn-cancelar')), 20000);
        expect(botonCancelar).not.toBeNull();

        await driver.executeScript("arguments[0].click();", botonCancelar);
        const btnConfirmarCancelacion = await driver.wait(until.elementIsVisible(driver.findElement(By.id('btnConfirmarCancelacion'))), 20000);
        await driver.executeScript("arguments[0].click();", btnConfirmarCancelacion);

        await driver.sleep(2000);
        const bodyTextActualizado = await driver.findElement(By.tagName('body')).getText();
        expect(bodyTextActualizado).toContain('CANCELADA');
    });
});