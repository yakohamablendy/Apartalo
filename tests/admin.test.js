// tests/admin.test.js

const { Builder, By, until } = require('selenium-webdriver');

// Aumentamos el timeout general de Jest para este archivo a 2 minutos
jest.setTimeout(120000);

describe('Flujo del Administrador', () => {
    let driver;

    beforeAll(async () => {
        driver = await new Builder().forBrowser('chrome').build();
    });

    
    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    test(' iniciar sesión como admin y ver el panel con todas las reservas', async () => {
        await driver.get('http://localhost:3000/pages/login.html');
        await driver.findElement(By.id('email')).sendKeys('michaelcs1526@gmail.com');
        await driver.findElement(By.id('password')).sendKeys('12345678');
        await driver.findElement(By.id('login-btn')).click();

        await driver.wait(until.urlContains('/historial.html'), 20000);
        const adminPanelLink = await driver.wait(until.elementLocated(By.linkText('Admin Panel')), 20000);
        
        await adminPanelLink.click();

        await driver.wait(until.urlContains('/admin.html'), 20000);
        const tablaReservas = await driver.findElement(By.id('reservas-admin-tbody'));
        expect(await tablaReservas.isDisplayed()).toBe(true);
        
        const filasReservas = await tablaReservas.findElements(By.tagName('tr'));
        expect(filasReservas.length).toBeGreaterThan(0);
    });
});