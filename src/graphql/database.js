import Sequelize from 'sequelize';
import { _ as lodash } from 'lodash';
import PHPUnserialize from 'php-unserialize';
// Hashing/JWT
import { checkPassword, encodeJWT, decodeJWT } from 'src/lib/hash';
// Error handler
import FormError from 'src/lib/error';
/* eslint-disable camelcase */

export default class Database {
  constructor(settings) {
    this.settings = settings;
    this.connection = this.connect(settings);
    this.connectors = this.getConnectors();
    this.models = this.getModels();
  }

  connect() {
    const { name, username, password, host, port } = this.settings.privateSettings.database;

    const Conn = new Sequelize(
      name,
      username,
      password,
      {
        dialect: 'mysql',
        host,
        port: port || 3306,
        define: {
          timestamps: false,
          freezeTableName: true,
          operatorsAliases: false,
          tableAliases: false,
        },
      },
    );

    return Conn;
  }

  getModels() {
    const prefix = this.settings.privateSettings.wpPrefix;
    const Conn = this.connection;

    return {
      Post: Conn.define(`${prefix}posts`, {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        post_author: { type: Sequelize.INTEGER },
        post_title: { type: Sequelize.STRING },
        post_content: { type: Sequelize.STRING },
        post_excerpt: { type: Sequelize.STRING },
        post_status: { type: Sequelize.STRING },
        post_type: { type: Sequelize.STRING },
        post_name: { type: Sequelize.STRING },
        post_parent: { type: Sequelize.INTEGER },
        menu_order: { type: Sequelize.INTEGER },
        post_date: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        post_date_gmt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        post_modified: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        post_modified_gmt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        comment_status: { type: Sequelize.STRING, defaultValue: 'open' },
        ping_status: { type: Sequelize.STRING, defaultValue: 'open' },
        guid: { type: Sequelize.STRING },
      }, { underscored: true }),
      Postmeta: Conn.define(`${prefix}postmeta`, {
        meta_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        post_id: { type: Sequelize.INTEGER },
        meta_key: { type: Sequelize.STRING },
        meta_value: { type: Sequelize.INTEGER },
      }, { underscored: true }),
      User: Conn.define(`${prefix}users`, {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        user_login: { type: Sequelize.STRING },
        user_pass: { type: Sequelize.TEXT, allowNull: true },
        user_nicename: { type: Sequelize.STRING },
        user_email: { type: Sequelize.STRING, allowNull: false },
        user_registered: { type: Sequelize.STRING },
        display_name: { type: Sequelize.STRING },
      }, { underscored: true }),
      Usermeta: Conn.define(`${prefix}usermeta`, {
        umeta_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: Sequelize.INTEGER },
        meta_key: { type: Sequelize.STRING },
        meta_value: { type: Sequelize.STRING },
      }),
      Terms: Conn.define(`${prefix}terms`, {
        term_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING },
        slug: { type: Sequelize.STRING },
        term_group: { type: Sequelize.INTEGER },
      }, { underscored: true }),
      TermRelationships: Conn.define(`${prefix}term_relationships`, {
        object_id: { type: Sequelize.INTEGER, primaryKey: true },
        term_taxonomy_id: { type: Sequelize.INTEGER },
        term_order: { type: Sequelize.INTEGER },
      }, { underscored: true }),
      TermTaxonomy: Conn.define(`${prefix}term_taxonomy`, {
        term_taxonomy_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        term_id: { type: Sequelize.INTEGER },
        taxonomy: { type: Sequelize.STRING },
        parent: { type: Sequelize.INTEGER },
        count: { type: Sequelize.INTEGER },
      }, { underscored: true }),
      Links: Conn.define(`${prefix}links`, {
        link_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        link_url: { type: Sequelize.STRING },
        link_name: { type: Sequelize.STRING },
        link_description: { type: Sequelize.STRING },
      }, { underscored: true }),
    };
  }

  getConnectors() {
    const { Post, Postmeta, User, Usermeta, Terms, TermRelationships, TermTaxonomy, Links } = this.getModels();
    const { amazonS3, uploads, defaultThumbnail, staffProperties, baseUrl } = this.settings.publicSettings;
    const { wpPrefix: prefix } = this.settings.privateSettings;

    Terms.hasMany(TermRelationships, { foreignKey: 'term_taxonomy_id' });
    TermRelationships.belongsTo(Terms, { foreignKey: 'term_taxonomy_id' });

    TermRelationships.hasMany(Postmeta, { foreignKey: 'post_id' });
    Postmeta.belongsTo(TermRelationships, { foreignKey: 'post_id' });

    Post.hasMany(TermRelationships, { foreignKey: 'object_id' });
    TermRelationships.belongsTo(Post, { foreignKey: 'object_id' });

    Post.hasMany(Postmeta, { foreignKey: 'post_id' });
    Postmeta.belongsTo(Post, { foreignKey: 'post_id' });

    User.hasMany(Usermeta, { foreignKey: 'user_id' });
    Usermeta.belongsTo(User, { foreignKey: 'user_id' });

    Terms.hasOne(TermTaxonomy, { foreignKey: 'term_id' });

    User.prototype.jwt = function jwt() {
      return encodeJWT({
        id: this.id,
      });
    };

    // Retrieve a session based on the JWT token.
    async function getUserOnJWT(token) {
      const e = new FormError();
      let user;
      let user_capabilities;
      try {
        // Attempt to decode the JWT token
        const data = decodeJWT(token);

        // We should have an ID attribute
        if (!data.id) throw new Error();

        // Check that we've got a valid session
        user = await User.findById(data.id);
        if (!user) throw new Error();

        const { meta_value } = await Usermeta.findOne({
          attributes: ['meta_value'],
          where: {
            user_id: user.id,
            meta_key: `${prefix}capabilities`,
          },
        });
        if (!meta_value) throw new Error();
        user_capabilities = meta_value.split('"')[1];
      } catch (_) {
        e.set('session', 'Invalid session ID');
      }
      e.throwIf();

      return {
        user,
        user_capabilities,
      };
    }

    // Login a user. Returns the inserted `session` instance on success, or
    // throws on failure
    async function login(data) {
      const e = new FormError();

      // Attempt to find the user based on the username
      const user = await User.findOne({
        where: { user_login: data.username },
      });

      // If we don't have a valid user, throw.
      if (!user) {
        e.set('username', 'An account with that username does not exist.');
      }

      e.throwIf();

      const checkCapabilities = await Usermeta.findOne({
        attributes: ['umeta_id'],
        where: {
          user_id: user.id,
          meta_key: `${prefix}capabilities`,
          meta_value: {
            $like: '%contributor%',
          },
        },
      });

      if (!checkCapabilities) {
        e.set('username', 'An account with that username does not exist.');
      }

      e.throwIf();

      // Check that the passwords match
      if (!await checkPassword(data.password, user.user_pass)) {
        e.set('password', 'Your password is incorrect.');
      }

      e.throwIf();

      return user;
    }

    return {
      async login(args) {
        try {
          const user = await login(args);
          return {
            ok: true,
            user,
          };
        } catch (e) {
          return {
            ok: false,
            errors: e,
          };
        }
      },

      async session(args, ctx) {
        try {
          // Attempt to retrieve the JWT based on the token that *may* be
          // available on the request context's `state`
          const { user, user_capabilities } = await getUserOnJWT(ctx.state.jwt);
          // Return the session record from the DB
          return {
            ok: true,
            user,
            user_capabilities,
          };
        } catch (e) {
          return {
            ok: false,
            errors: e,
          };
        }
      },

      async createPost(args, ctx) {
        const { user } = await getUserOnJWT(ctx.state.jwt);
        const { post_title, post_content, post_excerpt, post_status, categories } = args;
        const now = new Date();
        const newPost = await Post.create({
          post_author: user.id,
          post_content,
          post_title,
          post_excerpt,
          post_status,
        });
        await Post.update({
          guid: `${baseUrl}/?p=${newPost.id}`,
        }, {
          where: {
            id: newPost.id,
          },
        });
        await categories.map(category => {
          Terms.findOne({
            where: {
              name: category,
            },
          }).then(term => (
            TermRelationships.create({
              object_id: newPost.id,
              term_taxonomy_id: term.term_id,
            })
          ));
          return null;
        });
        await Post.create({
          post_author: user.id,
          post_content,
          post_title,
          post_excerpt,
          post_status: 'inherit',
          post_name: `${newPost.id}-revision-v1`,
          post_type: 'revision',
          comment_status: 'closed',
          ping_status: 'closed',
          post_parent: newPost.id,
          guid: `${baseUrl}/${now.getFullYear()}/${now.getMonth()}/${(`0${now.getDate()}`).slice(-2)}/${newPost.id}-revision-v1/`,
        });
        await Postmeta.create({
          post_id: newPost.id,
          meta_key: '_edit_lock',
          meta_value: `${Math.floor(now.getTime() / 1000)}:${user.id}`,
        });
        await Postmeta.create({
          post_id: newPost.id,
          meta_key: '_edit_last',
          meta_value: user.id,
        });
        return newPost;
      },

      async editPost(args, ctx) {
        const { user } = await getUserOnJWT(ctx.state.jwt);
        const { id, post_title, post_content, post_excerpt, post_status, categories } = args;
        if (post_status && post_status === 'publish') return null;
        const now = new Date();
        await Post.update({
          post_title,
          post_content,
          post_excerpt,
          post_status,
          post_date: now,
          post_date_gmt: now,
          post_modified: now,
          post_modified_gmt: now,
        }, {
          where: {
            id,
            post_author: user.id,
          },
        });
        await Post.create({
          post_author: user.id,
          post_content,
          post_title,
          post_excerpt,
          post_status: 'inherit',
          post_name: `${id}-revision-v1`,
          post_type: 'revision',
          comment_status: 'closed',
          ping_status: 'closed',
          post_parent: id,
          guid: `${baseUrl}/${now.getFullYear()}/${now.getMonth()}/${(`0${now.getDate()}`).slice(-2)}/${id}-revision-v1/`,
        });
        await Postmeta.update({
          meta_value: `${Math.floor(now.getTime() / 1000)}:${user.id}`,
        }, {
          where: {
            post_id: id,
            meta_key: '_edit_lock',
          },
        });
        await Postmeta.update({
          meta_value: user.id,
        }, {
          where: {
            post_id: id,
            meta_key: '_edit_last',
          },
        });
        const terms = await Terms.findAll({
          include: [{
            model: TermRelationships,
            where: {
              object_id: id,
            },
          }],
        });
        terms.map(term => {
          const index = categories.indexOf(term.name);
          if (index > -1) categories.splice(index, 1);
          else {
            TermRelationships.destroy({
              where: {
                object_id: id,
                term_taxonomy_id: term.term_id,
              },
            });
          }
        });
        categories.map(category => {
          Terms.findOne({
            where: {
              name: category,
            },
          }).then(term => (
            TermRelationships.create({
              object_id: id,
              term_taxonomy_id: term.term_id,
            })
          ));
          return null;
        });
        return Post.findById(id);
      },

      async deletePost(id, ctx) {
        const { user } = await getUserOnJWT(ctx.state.jwt);
        Post.destroy({
          where: {
            post_author: user.id,
            $or: [
              { id },
              {
                post_name: { $like: `${id}-revision%` },
                post_status: 'inherit',
              },
            ],
          },
        });
        Postmeta.destroy({
          where: {
            post_id: id,
          },
        });
        TermRelationships.destroy({
          where: {
            object_id: id,
          },
        });
        return id;
      },

      getLinks() {
        return Links.findAll();
      },

      getStaffs() {
        return Post.findAll({
          include: [{
            model: Postmeta,
          }],
          where: {
            post_type: 'staff',
            post_status: 'publish',
          },
        }).then(staffs => staffs.map(staff => {
          const staffProperty = {
            id: staff.id,
          };
          staff[`${prefix}postmeta`].map(staffmeta => {
            if (staffProperties.includes(staffmeta.meta_key)) { staffProperty[staffmeta.meta_key] = staffmeta.meta_value; }
          });
          return staffProperty;
        }));
      },

      getDefaultThumbnail() {
        return Postmeta.findOne({
          where: {
            meta_key: `_${prefix}attached_file`,
            meta_value: {
              $like: `%${defaultThumbnail}%`,
            },
          },
        }).then(thumbnail => {
          if (thumbnail) {
            const thumbnailSrc = amazonS3 ?
              `${uploads}PHPUnserialize.unserialize(thumbnail).key` :
              uploads + thumbnail.meta_value;

            return thumbnailSrc;
          }
          return null;
        });
      },

      async getMyPosts({ statuses, categories, limit, skip }, ctx) {
        const { user } = await getUserOnJWT(ctx.state.jwt);
        let termsId;
        if (categories.length > 0) {
          termsId = await Terms.findAll({
            where: {
              name: {
                $in: categories,
              },
            },
          }).then(terms => lodash.map(terms, 'term_id'));
        } else {
          termsId = await TermTaxonomy.findAll({
            where: {
              taxonomy: 'category',
            },
          }).then(terms => lodash.map(terms, 'term.id'));
        }
        return Post.findAll({
          include: {
            model: TermRelationships,
            where: {
              term_taxonomy_id: {
                $in: termsId,
              },
            },
          },
          where: {
            post_author: user.id,
            post_type: 'post',
            post_status: {
              $in: statuses,
            },
          },
          limit,
          offset: skip,
          order: [
            ['post_date', 'DESC'],
          ],
        });
      },

      async getMyTotalPosts({ statuses, categories }, ctx) {
        const { user } = await getUserOnJWT(ctx.state.jwt);
        let termsId;
        if (categories.length > 0) {
          termsId = await Terms.findAll({
            where: {
              name: {
                $in: categories,
              },
            },
          }).then(terms => lodash.map(terms, 'term_id'));
        } else {
          termsId = await TermTaxonomy.findAll({
            where: {
              taxonomy: 'category',
            },
          }).then(terms => lodash.map(terms, 'term.id'));
        }
        return Post.count({
          include: {
            model: TermRelationships,
            where: {
              term_taxonomy_id: {
                $in: termsId,
              },
            },
          },
          where: {
            post_author: user.id,
            post_type: 'post',
            post_status: {
              $in: statuses,
            },
          },
        });
      },

      async getMyPost(id, ctx) {
        const { user } = await getUserOnJWT(ctx.state.jwt);
        return Post.findOne({
          where: {
            id,
            post_type: 'post',
            post_author: user.id,
            post_status: {
              $not: 'publish',
            },
          },
        });
      },

      getPosts({ post_type, limit = 10, skip = 0 }) {
        return Post.findAll({
          where: {
            post_type,
            post_status: 'publish',
          },
          limit,
          offset: skip,
          order: [
            ['post_date', 'DESC'],
          ],
        });
      },

      getTotalPosts({ post_type }) {
        return Post.count({
          where: {
            post_type,
            post_status: 'publish',
          },
        });
      },

      getPostsInCategory(termId, { post_type, limit = 10, skip = 0 }) {
        return TermRelationships.findAll({
          include: {
            model: Post,
            where: {
              post_type,
              post_status: 'publish',
            },
          },
          where: {
            term_taxonomy_id: termId,
          },
          limit,
          offset: skip,
          order: [
            [Post, 'post_date', 'DESC'],
          ],
        }).then(posts => posts.map(post => post[`${prefix}post`]));
      },

      getTotalPostsInCategory(termId, { post_type }) {
        return TermRelationships.count({
          include: {
            model: Post,
            where: {
              post_type,
              post_status: 'publish',
            },
          },
          where: {
            term_taxonomy_id: termId,
          },
        });
      },

      async getCategoriesByPostId(id) {
        const categories = [];
        const categoriesId = await TermRelationships.findAll({
          where: {
            object_id: id,
          },
        });
        if (categoriesId) {
          categoriesId.map(categoryId => (
            categories.push(Terms.findById(categoryId.term_taxonomy_id).then(category => category.dataValues.name))
          ));
          return categories;
        }
        return null;
      },

      getCategories() {
        return Terms.findAll({
          include: {
            model: TermTaxonomy,
            where: {
              taxonomy: 'category',
            },
          },
        }).then(categories => lodash.map(categories, 'name'));
      },

      getCategoryById(termId) {
        return Terms.findById(termId);
      },

      getCategory(slug) {
        return Terms.findOne({
          where: { slug },
        });
      },

      getPostById(postId) {
        return Post.findOne({
          where: {
            post_status: 'publish',
            id: postId,
          },
        }).then(post => {
          if (post) {
            const { id } = post.dataValues;
            post.dataValues.children = [];
            return Post.findAll({
              attributes: ['id'],
              where: {
                post_parent: id,
              },
            }).then(childPosts => {
              if (childPosts.length > 0) {
                childPosts.map(childPost =>
                  post.dataValues.children.push({ id: Number(childPost.dataValues.id) }),
                );
              }
              return post;
            });
          }
          return null;
        });
      },

      getPostByName(name) {
        return Post.findOne({
          where: {
            post_status: 'publish',
            post_name: name,
          },
        });
      },

      getPostThumbnail(postId) {
        return Postmeta.findOne({
          where: {
            post_id: postId,
            meta_key: '_thumbnail_id',
          },
        }).then(res => {
          if (res) {
            const metaKey = amazonS3 ? 'amazonS3_info' : `_${prefix}attached_file`;

            return Post.findOne({
              where: {
                id: Number(res.dataValues.meta_value),
              },
              include: {
                model: Postmeta,
                where: {
                  meta_key: metaKey,
                },
                limit: 1,
              },
            }).then(post => {
              if (post[`${prefix}postmeta`][0]) {
                const thumbnail = post[`${prefix}postmeta`][0].dataValues.meta_value;
                const thumbnailSrc = amazonS3 ?
                  uploads + PHPUnserialize.unserialize(thumbnail).key :
                  uploads + thumbnail;

                return thumbnailSrc;
              }
              return null;
            });
          }
          return null;
        });
      },

      getUser(id) {
        return User.findById(id);
      },

      getPostLayout(postId) {
        return Postmeta.findOne({
          where: {
            post_id: postId,
            meta_key: 'page_layout_component',
          },
        });
      },

      getPostmetaById(metaId, keys) {
        return Postmeta.findOne({
          where: {
            meta_id: metaId,
            meta_key: {
              $in: keys,
            },
          },
        });
      },

      getPostmeta(postId, keys) {
        return Postmeta.findAll({
          where: {
            post_id: postId,
            meta_key: {
              $in: keys,
            },
          },
        });
      },

      getMenu(name) {
        return Terms.findOne({
          where: {
            slug: name,
          },
          include: [{
            model: TermRelationships,
            include: [{
              model: Post,
              include: [Postmeta],
            }],
          }],
        }).then(res => {
          if (res) {
            const menu = {
              id: null,
              name,
              items: null,
            };
            menu.id = res.term_id;
            const relationship = res[`${prefix}term_relationships`];
            const posts = lodash.map(lodash.map(lodash.map(relationship, `${prefix}post`), 'dataValues'), post => {
              const postmeta = lodash.map(post[`${prefix}postmeta`], 'dataValues');
              const parentMenuId = lodash.map(lodash.filter(postmeta, meta => meta.meta_key === '_menu_item_menu_item_parent'), 'meta_value');
              post.post_parent = parseInt(parentMenuId[0]);
              return post;
            });
            const navItems = [];

            const parentIds = lodash.map(lodash.filter(posts, post => (
              post.post_parent === 0
            )), 'id');

            lodash.map(lodash.sortBy(posts, 'post_parent'), post => {
              const navItem = {};
              const postmeta = lodash.map(post[`${prefix}postmeta`], 'dataValues');
              const isParent = parentIds.includes(post.id);
              let objectType = lodash.map(lodash.filter(postmeta, meta => meta.meta_key === '_menu_item_object'), 'meta_value');
              objectType = objectType[0];
              let url = lodash.map(lodash.filter(postmeta, meta => meta.meta_key === '_menu_item_url'), 'meta_value');
              url = url[0];
              const linkedId = Number(lodash.map(lodash.filter(postmeta, meta => meta.meta_key === '_menu_item_object_id'), 'meta_value'));

              if (isParent) {
                navItem.id = post.id;
                navItem.post_title = post.post_title;
                navItem.order = post.menu_order;
                navItem.linkedId = linkedId;
                navItem.object_type = objectType;
                navItem.url = url;
                navItem.children = [];
                navItems.push(navItem);
              } else {
                const parentId = Number(lodash.map(lodash.filter(postmeta, meta => meta.meta_key === '_menu_item_menu_item_parent'), 'meta_value'));
                const existing = navItems.filter(item => (
                  item.id === parentId
                ));

                if (existing.length) {
                  const navItemChild = {};
                  navItemChild.id = post.id;
                  navItemChild.post_title = post.post_title;
                  navItemChild.order = post.menu_order;
                  navItemChild.linkedId = linkedId;
                  navItemChild.object_type = objectType;
                  navItemChild.url = url;
                  navItemChild.children = [];
                  existing[0].children.push(navItemChild);
                }
              }
              menu.items = navItems;
            });
            return menu;
          }
          return null;
        });
      },
    };
  }
}
