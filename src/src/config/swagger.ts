import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config({ path: `./env/.env.${process.env.NODE_ENV || 'development'}` });

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Course Service API',
      version: '1.0.0',
      description: 'API documentation for the Course Service microservice',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/**/*.ts'], // Đường dẫn tới các file route có định nghĩa Swagger
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
export default swaggerDocs;
