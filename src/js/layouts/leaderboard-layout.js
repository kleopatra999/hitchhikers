import Backbone             from 'backbone';
import Marionette           from 'backbone.marionette';
import leaderBoardsTemplate from '../../templates/leaderboard/layout.hbs';
import LeaderBoardView      from '../views/leaderboard-view';
import apiConfig            from '../../../config/api';

var CountryCollection = Backbone.Collection.extend({
  url: apiConfig.baseURL + apiConfig.leaderboardCountry,
});

var DistanceCollection = Backbone.Collection.extend({
  url: apiConfig.baseURL + apiConfig.leaderboardDistance,
});

var UsersCollection = Backbone.Collection.extend({
  url: apiConfig.baseURL + apiConfig.leaderboardUsers,
});

export default Marionette.LayoutView.extend({
  template: leaderBoardsTemplate,

  regions: {
    distance: '[data-component="distance-travelled"]',
    locations: '[data-component="locations"]',
    members: '[data-component="members"]',
  },

  onRender: function() {
    this.distance.show(new LeaderBoardView({
      model:      new Backbone.Model({ title: 'Lightmiles Traveled' }),
      collection: new DistanceCollection(),
    }));

    var locationsCollection =     this.locations.show(new LeaderBoardView({
      model:      new Backbone.Model({ title: 'Hitchhiking Hometowns' }),
      collection: new CountryCollection(),
    }));

    this.members.show(new LeaderBoardView({
      model:      new Backbone.Model({ title: 'Hitchhikers Gathered' }),
      collection: new UsersCollection(),
    }));
  },
});