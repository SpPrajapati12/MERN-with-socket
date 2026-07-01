import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MERN Backend API",
      version: "1.0.0",
      description: "Production-ready MERN backend API documentation",
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export default swaggerJsdoc(options);
