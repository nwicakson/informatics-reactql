import Sequelize from 'sequelize';
import { _ as lodash } from 'lodash';
import PHPUnserialize from 'php-unserialize';
// Hashing/JWT
import { encodeJWT, decodeJWT } from 'src/lib/hash';
import hasher from 'wordpress-hash-node';
// Error handler
import FormError from 'src/lib/error';

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
        id: { type: Sequelize.INTEGER, primaryKey: true },
        post_author: { type: Sequelize.INTEGER },
        post_title: { type: Sequelize.STRING },
        post_content: { type: Sequelize.STRING },
        post_excerpt: { type: Sequelize.STRING },
        post_status: { type: Sequelize.STRING },
        post_type: { type: Sequelize.STRING },
        post_name: { type: Sequelize.STRING },
        post_parent: { type: Sequelize.INTEGER },
        menu_order: { type: Sequelize.INTEGER },
      }, { underscored: true }),
      Postmeta: Conn.define(`${prefix}postmeta`, {
        meta_id: { type: Sequelize.INTEGER, primaryKey: true, field: 'meta_id' },
        post_id: { type: Sequelize.INTEGER },
        meta_key: { type: Sequelize.STRING },
        meta_value: { type: Sequelize.INTEGER },
      }, { underscored: true }),
      User: Conn.define(`${prefix}users`, {
        id: { type: Sequelize.INTEGER, primaryKey: true },
        user_login: { type: Sequelize.STRING },
        user_pass: { type: Sequelize.TEXT, allowNull: true },
        user_nicename: { type: Sequelize.STRING },
        user_email: { type: Sequelize.STRING, allowNull: false },
        user_registered: { type: Sequelize.STRING },
        display_name: { type: Sequelize.STRING },
      }, { underscored: true }),
      Usermeta: Conn.define(`${prefix}usermeta`, {
        umeta_id: { type: Sequelize.INTEGER, primaryKey: true },
        user_id: { type: Sequelize.INTEGER },
        meta_key: { type: Sequelize.STRING },
        meta_value: { type: Sequelize.STRING },
      }),
      Terms: Conn.define(`${prefix}terms`, {
        term_id: { type: Sequelize.INTEGER, primaryKey: true },
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
        term_taxonomy_id: { type: Sequelize.INTEGER, primaryKey: true },
        term_id: { type: Sequelize.INTEGER },
        taxonomy: { type: Sequelize.STRING },
        parent: { type: Sequelize.INTEGER },
        count: { type: Sequelize.INTEGER },
      }, { underscored: true }),
      Session: Conn.define('sessions', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
        user_id: { type: Sequelize.INTEGER },
        expires_at: { type: Sequelize.DATE, allowNull: true },
      }, {
        hooks: {
          beforeValidate(inst) {
            // Set expiration to be 30 days from now
            const now = new Date();
            now.setDate(now.getDate() + 30);
            /* eslint-disable no-param-reassign */
            inst.expires_at = now;
          },
        },
      }, { underscored: true }),
    };
  }

  getConnectors() {
    const { amazonS3, uploads, defaultThumbnail, staffProperties } = this.settings.publicSettings;
    const { Post, Postmeta, User, Usermeta, Terms, TermRelationships, Session } = this.getModels();
    const prefix = this.settings.privateSettings.wpPrefix;

    Terms.hasMany(TermRelationships, { foreignKey: 'term_taxonomy_id' });
    TermRelationships.belongsTo(Terms, { foreignKey: 'term_taxonomy_id' });

    TermRelationships.hasMany(Postmeta, { foreignKey: 'post_id' });
    Postmeta.belongsTo(TermRelationships, { foreignKey: 'post_id' });

    TermRelationships.belongsTo(Post, { foreignKey: 'object_id' });

    Post.hasMany(Postmeta, { foreignKey: 'post_id' });
    Postmeta.belongsTo(Post, { foreignKey: 'post_id' });

    User.hasMany(Usermeta, { foreignKey: 'user_id' });
    Usermeta.belongsTo(User, { foreignKey: 'user_id' });

    User.hasMany(Session, { foreignKey: 'user_id' });
    Session.belongsTo(User, { foreignKey: 'user_id' });

    this.connection.sync();

    Session.prototype.jwt = function jwt() {
      return encodeJWT({
        id: this.id,
      });
    };

    // Create a new session.  Accepts a loaded user instance, and returns a
    // new session object
    async function createSession(user) {
      return Session.create({
        user_id: user.id,
      });
    }

    // Retrieve a session based on the JWT token.
    async function getSessionOnJWT(token) {
      const e = new FormError();
      let session;

      try {
        // Attempt to decode the JWT token
        const data = decodeJWT(token);
        // We should have an ID attribute
        if (!data.id) throw new Error();

        // Check that we've got a valid session
        session = await Session.findById(data.id);
        if (!session) throw new Error();
      } catch (_) {
        e.set('session', 'Invalid session ID');
      }

      // Throw if we have errors
      e.throwIf();

      return session;
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
          meta_key: 'wp_capabilities',
          meta_value: {
            $like: '%subscriber%',
          },
        },
      });

      if (!checkCapabilities) {
        e.set('username', 'An account with that username does not exist.');
      }

      e.throwIf();

      // Check that the passwords match
      if (!await hasher.CheckPassword(data.password, user.user_pass)) {
        e.set('password', 'Your password is incorrect.');
      }

      e.throwIf();

      const session = await createSession(user);

      // Create the new session
      return session;
    }

    return {
      async login(args, ctx) {
        try {
          const session = await login(args);
          // If getting the JWT didn't throw, then we know we have a valid
          // JWT -- store it on a cookie so that we can re-use it for future
          // requests to the server
          ctx.cookies.set('reactQLJWT', session.jwt(), {
            expires: session.expires_at,
          });

          // Return the session record from the DB
          return {
            ok: true,
            session,
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
          const session = await getSessionOnJWT(ctx.state.jwt);
          // Return the session record from the DB
          return {
            ok: true,
            session,
          };
        } catch (e) {
          return {
            ok: false,
            errors: e,
          };
        }
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
            meta_key: '_wp_attached_file',
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

      getPosts({ post_type, limit = 10, skip = 0 }) {
        return Post.findAll({
          where: {
            post_type,
            post_status: 'publish',
          },
          limit,
          offset: skip,
        });
      },

      getPostsInCategory(termId, { post_type, limit = 10, skip = 0 }) {
        return TermRelationships.findAll({
          attributes: [],
          include: [{
            model: Post,
            where: {
              post_type,
              post_status: 'publish',
            },
          }],
          where: {
            term_taxonomy_id: termId,
          },
          limit,
          offset: skip,
        }).then(posts => lodash.map(posts, post => post[`${prefix}post`]));
      },

      getCategoryById(termId) {
        return Terms.findOne({
          where: { termId },
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
                lodash.map(childPosts, childPost => {
                  post.dataValues.children.push({ id: Number(childPost.dataValues.id) });
                });
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
            const relationship = res.wp_term_relationships;
            const posts = lodash.map(lodash.map(lodash.map(relationship, 'wp_post'), 'dataValues'), post => {
              const postmeta = lodash.map(post.wp_postmeta, 'dataValues');
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
              const postmeta = lodash.map(post.wp_postmeta, 'dataValues');
              const isParent = lodash.includes(parentIds, post.id);
              let objectType = lodash.map(lodash.filter(postmeta, meta => meta.meta_key === '_menu_item_object'), 'meta_value');
              objectType = objectType[0];
              const linkedId = Number(lodash.map(lodash.filter(postmeta, meta => meta.meta_key === '_menu_item_object_id'), 'meta_value'));

              if (isParent) {
                navItem.id = post.id;
                navItem.post_title = post.post_title;
                navItem.order = post.menu_order;
                navItem.linkedId = linkedId;
                navItem.object_type = objectType;
                navItem.children = [];
                navItems.push(navItem);
              } else {
                const parentId = Number(lodash.map(lodash.filter(postmeta, meta => meta.meta_key === '_menu_item_menu_item_parent'), 'meta_value'));
                const existing = navItems.filter(item => (
                  item.id === parentId
                ));

                if (existing.length) {
                  existing[0].children.push({ id: post.id, linkedId });
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
