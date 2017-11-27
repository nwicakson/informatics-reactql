// it's like rest endpoint
const Definitions = `
  scalar Date

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
    url: String
    navitemcategory : Category
    children: [MenuItem]
  }

  type Category {
    term_id: Int!
    name: String
    slug: String
    posts(post_type: String = "post", limit: Int, skip: Int): [Post]
    total_posts(post_type: String = "post"): Int
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
    post_date: Date
    menu_order: Int
    post_author: Int
    categories: [Category]
    thumbnail: String
    post_meta(keys: [MetaType], after: String, first: Int, before: String, last: Int): Postmeta
    author: User
  }

  enum MetaType {
    thumbnailID
    attachedFile
    reactLayout
    amazonInfo
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
    id: String
    user_login: String
    user_pass: String
    user_nicename: String
    user_email: String
    user_registered: String
    display_name: String
  }

  type Link {
    link_id: Int
    link_url: String
    link_name: String
    link_description: String
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

  type Session {
    ok: Boolean!
    errors: [Field]
    jwt: String
    user: User
    user_capabilities: String
  }

  type Query {
    settings: Setting
    posts(post_type: String = "post", limit: Int = 10, skip: Int = 0): [Post]
    total_posts(post_type: String = "post"): Int
    my_posts(statuses: [String] = ["publish", "draft", "pending"], categories: [String] = [], limit: Int = 10, skip: Int = 0): [Post]
    my_total_posts(statuses: [String] = ["publish", "draft", "pending"], categories: [String] = []): Int
    my_post(id: Int): Post
    menu(name: String): Menu
    post(name: String, id: Int): Post
    categories: [Category]
    category(term_id: Int, slug: String): Category
    postmeta(post_id: Int, after: String, first: Int, before: String, last: Int): Postmeta
    user(id: String): User
    staffs: [Staff]
    session: Session
    links: [Link]
  }

  type Mutation {
    login(username: String, password: String): Session
    create_post(post_title: String, post_content: String, post_excerpt: String, post_status: String = "draft", categories: [String] = ["Uncategorized"]): Post
    edit_post(id: Int, post_title: String, post_content: String, post_excerpt: String, post_status: String, categories: [String]): Post
    delete_post(id: Int): Int
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

export default [Definitions];
