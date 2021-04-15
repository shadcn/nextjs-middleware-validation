import * as yup from "yup"
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import type { ObjectShape, OptionalObjectSchema } from "yup/lib/object"

export function withMethods(methods: string[], handler: NextApiHandler) {
  return async function (request: NextApiRequest, response: NextApiResponse) {
    if (!methods.includes(request.method)) {
      return response.status(405).json("")
    }

    return handler(request, response)
  }
}

export function withValidation<T extends OptionalObjectSchema<ObjectShape>>(
  schema: T,
  handler: NextApiHandler
) {
  return async function (request: NextApiRequest, response: NextApiResponse) {
    try {
      request.body = await schema.validate(request.body)

      return handler(request, response)
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return response.status(422).json(error.message)
      }

      return response.status(422).json("")
    }
  }
}

const postSchema = yup.object({
  title: yup.string().required("`Title` field missing."),
  body: yup.string().required("`Body` field missing"),
})

interface Post extends yup.TypeOf<typeof postSchema> {}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const post: Post = request.body

  // TODO: Save post.

  response.status(201).json("")
}

export default withMethods(["POST"], withValidation(postSchema, handler))
