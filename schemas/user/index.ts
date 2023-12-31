import { defineField, defineType } from 'sanity'
import { GET_USERS_QUERY } from '../../utils/queries'
import languages from '../../static/languages.json'

const language: string = window.navigator.language

export default defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  initialValue: {
    lang: language.slice(0, 2) === 'en' ? 'en' : 'th',
  },
  preview: {
    select: {
      fname: 'fname',
      lname: 'lname',
    },
    prepare: ({ fname, lname }) => {
      return {
        title: `${fname} ${lname}`,
      }
    },
  },
  fields: [
    defineField({
      name: 'fname',
      title: 'First Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'lname',
      title: 'Last Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'email',
      validation: (Rule) =>
        Rule.required().custom(async (email, { document, getClient }) => {
          const _id = document?._id.startsWith('drafts.')
            ? document?._id.slice(7)
            : document?._id
          const client = getClient({ apiVersion: '2023-06-26' })
          const getUsers: User[] = await client.fetch(GET_USERS_QUERY)
          const existingEmails = getUsers
            .filter((val: User) => {
              if (val._id.startsWith('drafts.')) {
                return false
              } else {
                return val._id !== _id
              }
            })
            .map((val) => val.email)
          if (email !== undefined && existingEmails.includes(email)) {
            return 'This email is already in use. Try another one.'
          }
          return true
        }),
    }),
    defineField({
      name: 'lang',
      title: 'Preferred Language',
      type: 'string',
      options: {
        list: languages,
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
})
