import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  getHello(@Res() res: Response) {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Control Activos API</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
        <style>
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            body {
                font-family: 'Outfit', sans-serif;
                background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
                color: #f8fafc;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                position: relative;
            }
            body::before {
                content: '';
                position: absolute;
                width: 600px;
                height: 600px;
                background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
                top: -10%;
                left: -10%;
                z-index: 1;
            }
            body::after {
                content: '';
                position: absolute;
                width: 600px;
                height: 600px;
                background: radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
                bottom: -10%;
                right: -10%;
                z-index: 1;
            }
            .card {
                background: rgba(30, 41, 59, 0.7);
                backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 24px;
                padding: 3rem;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
                z-index: 10;
                transform: translateY(0);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 25px 30px -5px rgba(99, 102, 241, 0.2), 0 15px 15px -5px rgba(0, 0, 0, 0.4);
            }
            .logo-container {
                margin-bottom: 1.5rem;
                display: inline-flex;
                justify-content: center;
                align-items: center;
                width: 80px;
                height: 80px;
                border-radius: 20px;
                background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
                box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
            }
            .logo-icon {
                font-size: 2.5rem;
                font-weight: 800;
                background: linear-gradient(to right, #ffffff, #e0e7ff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            h1 {
                font-size: 2rem;
                font-weight: 800;
                margin-bottom: 0.5rem;
                background: linear-gradient(to right, #fff, #94a3b8);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .status {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.2);
                color: #10b981;
                padding: 0.4rem 1rem;
                border-radius: 100px;
                font-size: 0.875rem;
                font-weight: 600;
                margin-bottom: 1.5rem;
            }
            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #10b981;
                box-shadow: 0 0 8px #10b981;
                animation: pulse 1.5s infinite;
            }
            p {
                color: #94a3b8;
                font-size: 1rem;
                line-height: 1.6;
                margin-bottom: 2rem;
            }
            .btn {
                display: inline-block;
                width: 100%;
                background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                color: white;
                text-decoration: none;
                padding: 1rem 2rem;
                border-radius: 12px;
                font-weight: 600;
                transition: opacity 0.2s ease, transform 0.2s ease;
                box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
            }
            .btn:hover {
                opacity: 0.95;
                transform: scale(1.02);
            }
            .footer {
                margin-top: 2rem;
                font-size: 0.75rem;
                color: #64748b;
            }
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.4); opacity: 0.5; }
                100% { transform: scale(1); opacity: 1; }
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="logo-container">
                <span class="logo-icon">J</span>
            </div>
            <h1>Jibby Control Activos</h1>
            <div class="status">
                <span class="status-dot"></span>
                API Operando
            </div>
            <p>El backend de Control de Activos está funcionando correctamente y listo para recibir peticiones.</p>
            <a href="/api/docs" class="btn">Explorar Documentación API (Swagger)</a>
            <div class="footer">
                Versión ${process.env.VERSION || '1.0.0'} &bull; &copy; 2026 Jibby Corp. Todos los derechos reservados.
            </div>
        </div>
    </body>
    </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  }
}
