const z = require('zod')

const schema = z.object({
  nombre: z.string({ required_error: 'Name is required', invalid_type_error: 'Name must be a string' }),
  año: z.number().gt(1900).int().lt(2024),
  empresa: z.string(),
  genero: z.array(z.enum(['Romance', 'Drama', 'Ciencia ficción', 'Aventura', 'Crimen', 'Acción', 'Comedia', 'Biografía', 'Fantasía', 'Thriller']))
})

function validateMovie (object) {
  return schema.safeParse(object)
}

function validatePartialMovie (object) {
  return schema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
