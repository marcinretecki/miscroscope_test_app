Posts = new Meteor.Collection("posts");

Posts.allow({
  update: ownsDocument,
  remove: ownsDocument
});

Posts.deny({
  update: function(userId, post, fieldNames) {
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});

Meteor.methods({
  post: function(postAttributes) {
    var user = Meteor.user(),
        postWithSameLink = Posts.findOne({url: postAttributes.url});

    if (!user) {
      throw new Meteor.Error(401, "Musisz się zalogować Amigo.");
    }

    if (!postAttributes.title) {
      throw new Meteor.Error(401, "Wypełnij tytuł Amigo");
    }

    if (postAttributes.url && postWithSameLink) {
      throw new Meteor.Error(302, "Ten adres mamy już w bazie Amigo", postWithSameLink._id);
    }

    var post = _.extend(_.pick(postAttributes, 'url', 'title', 'message'), {
      userId: user._id,
      author: user.username,
      submitted: new Date().getTime(),
      commentsCount: 0
    });

    var postId = Posts.insert(post);

    return postId;
  }
})