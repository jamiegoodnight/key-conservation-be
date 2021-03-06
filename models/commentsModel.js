const db = require('../database/dbConfig');

const CampUpdate = require('./updateModel');

function find() {
  return db('comments');
}

function findById(id) {
  return db('comments')
    .where({ comment_id: id })
    .first();
}

function findCampaignComments(id) {
  return db('comments')
    .where({ camp_id: id })
    .join('users', 'users.id', 'comments.users_id')
    .leftJoin('conservationists as cons', 'cons.users_id', 'users.id')
    .leftJoin('supporters as sup', 'sup.users_id', 'users.id')
    .select(
      'comments.*',
      'users.profile_image',
      'cons.org_name',
      'sup.sup_name',
      'users.is_deactivated'
    )
    .then(res => {
      const comments = res
        .map(com => ({ ...com, name: com.org_name || com.sup_name || 'User' }))
        .filter(c => !c.is_deactivated)
        .sort((a, b) => b.created_at - a.created_at);
      return comments;
    });
}

function insert(comment) {
  return db('comments')
    .insert(comment)
    .then(
      () => findCampaignComments(comment.camp_id)
      // return db('campaigns')
      //   .where({ camp_id: comment.camp_id })
      //   .join('users', 'users.id', 'campaigns.users_id')
      //   .select(
      //     'users.username',
      //     'users.profile_image',
      //     'users.location',
      //     'campaigns.*'
      //   )
      //   .first()
      //   .then(campaign => {
      //     return CampUpdate.findUpdatesByCamp(comment.camp_id)
      //       .then(updates => {
      //         campaign.updates = updates;
      //         return campaign;
      //       })
      //       .then(campaign => {
      //         return findCampaignComments(comment.camp_id)
      //           .then(comments => {
      //             campaign.comments = comments;
      //             return campaign;
      //           })
      //           .then(campaign => {
      //             return campaign;
      //           });
      //       });
      //   });
    );
}
// Possible circular dependency issue prevented me from simply calling findById from campaignModel.js in the above function
// Commented out for now, while I investigate issues on the dev server

function update(id, changes) {
  return db('comments')
    .where({ comment_id: id })
    .update(changes)
    .then(() => findById(id));
}

function remove(id) {
  return db('comments')
    .where({ comment_id: id })
    .del()
    .then(() => id);
}

module.exports = {
  find,
  findById,
  findCampaignComments,
  insert,
  update,
  remove
};
