const express = require('express')
const crypto = require('node:crypto')
const movies = require('./data/movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')
const PORT = process.env.PORT ?? 3000

const app = express()
app.disable('x-powered-by') // Esto deshabilita el header 'X-Powered-By' para que no sea mostrado y tener una falla de seguridad
app.use(express.json()) // Esto es para que express entienda JSON en el body

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://movies.com'
]
// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin

  // Habilito el CORS para todos los ACCEPTED_ORIGINS, no se suele usar *
  // Esto solamente funciona para los metodos "seguros" que son GET, HEAD, y POST.
  // Para hacerlo compatible con los otros metodos PUT, PATCH, DELETE es necesario agregar el header OPTIONS con 'Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE').

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  }

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).send()
  }

  next()
})

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter((movie) => movie.genero.some((g) => g.toLowerCase() === genre.toLowerCase()))
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find((movie) => movie.id === Number(id))
  if (movie) return res.json(movie)
  return res.status(404).send('Movie not found')
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = { id: crypto.randomUUID(), ...result.data }
  movies.push(newMovie)
  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === Number(id))
  if (movieIndex === -1) {
    return res.status(404).send('Movie not found')
  }

  movies[movieIndex] = { ...movies[movieIndex], ...result.data }
  res.json(movies[movieIndex])
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params

  const movieIndex = movies.findIndex((movie) => movie.id === Number(id))
  if (movieIndex === -1) {
    return res.status(404).send('Movie not found')
  }

  movies.splice(movieIndex, 1)
  res.status(204).send()
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
