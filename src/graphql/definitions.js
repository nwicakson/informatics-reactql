// it's like rest endpoint
const Definitions = `
  type Menu {
    id: ID!
    name: String
    items: [MenuItem]
  }

  type MenuItem {
    id: ID!
    post_title: String
    linkedId: Int
    object_type: String
    order: Int
    navitem: Post
    children: [MenuItem]
  }

  enum MetaType {
    thumbnailID
    attachedFile
    reactLayout
    amazonInfo
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type Category {
    term_id: Int!
    name: String
    slug: String
    posts(post_type: String = "post", limit: Int, skip: Int): [Post]
  }

  type Post {
    id: Int
    post_title: String
    post_content: String
    post_excerpt: String
    post_status: String
    post_type: String
    post_name: String
    post_parent: Int
    menu_order: Int
    post_author: Int
    layout: Postmeta
    thumbnail: String
    post_meta(keys: [MetaType], after: String, first: Int, before: String, last: Int): Postmeta
    author: User
  }

  type Postmeta {
    id: Int
    meta_id: Int
    post_id: Int
    meta_key: String
    meta_value: String
    connecting_post: Post
  }

  type User {
    id: Int
    user_login: String
    user_pass: String
    user_nicename: String
    user_email: String
    user_registered: String
    display_name: String
  }

  type Setting {
    uploads: String
    amazonS3: Boolean
    defaultThumbnail: String
  }

  type Staff {
    id: Int
    name: String
    email: String
    field_of_research: String
    last_education_degree: String
    last_education_place: String
    position: String
  }

  type Field {
    field: String
    message: String
  }

  type UserResponse {
    ok: Boolean!
    errors: [Field]
    user: User
  }

  type Session {
    ok: Boolean!
    errors: [Field]
    jwt: String
    user: User
  }

  type Query {
    settings: Setting
    posts(post_type: String = "post", limit: Int, skip: Int): [Post]
    menu(name: String): Menu
    post(name: String, id: Int): Post
    category(term_id: Int): Category
    postmeta(post_id: Int, after: String, first: Int, before: String, last: Int): Postmeta
    user(id: Int): User
    staffs: [Staff]
    session: Session
  }

  type Mutation {
    login(username: String, password: String): Session
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

export default [Definitions];
