// tests/cliente.test.js

const { Builder, By, until } = require('selenium-webdriver');

jest.setTimeout(120000); 

describe('Flujo Completo del Cliente', () => {
    let driver;

    beforeAll(async () => {
        driver = await new Builder().forBrowser('chrome').build();
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
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