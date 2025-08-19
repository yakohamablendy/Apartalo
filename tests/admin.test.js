// tests/admin.test.js

const { Builder, By, until } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');

jest.setTimeout(180000);

describe('Flujo del Administrador', () => {
    let driver;

    beforeAll(async () => {
        console.log('[Admin Test] - Iniciando el hook beforeAll...');

        // El modo headless está comentado para que puedas ver el navegador.
        const chromeOptions = new Options()
            // .addArguments('--headless') // <--- LÍNEA MODIFICADA
            .addArguments('--disable-gpu')
            .addArguments('--window-size=1920,1080');

        try {
            console.log('[Admin Test] - Construyendo el driver de Chrome...');
            driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
            console.log('[Admin Test] - Driver construido exitosamente.');
        } catch (error) {
            console.error('[Admin Test] - Error al construir el driver:', error);
            throw error;
        }
    });

    afterAll(async () => {
        console.log('[Admin Test] - Iniciando el hook afterAll...');
        if (driver) {
            await driver.quit();
            console.log('[Admin Test] - Driver cerrado exitosamente.');
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