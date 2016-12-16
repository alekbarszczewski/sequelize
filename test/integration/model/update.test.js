'use strict';

/* jshint -W030 */
var Support = require(__dirname + '/../support')
  , DataTypes = require(__dirname + '/../../../lib/data-types')
  , chai = require('chai')
  , expect = chai.expect
  , Support = require(__dirname + '/../support')
  , current = Support.sequelize
  , _ = require('lodash');

describe(Support.getTestDialectTeaser('Model'), function() {
  describe('update', function () {

    var Account;

    beforeEach(function() {
      Account = this.sequelize.define('Account', {
        ownerId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'owner_id'
        },
        name: {
          type: DataTypes.STRING
        }
      });
      return Account.sync({force: true});
    });

    it('should only update the passed fields', function () {
      return Account.create({
        ownerId: 2
      }).then(function (account) {
        return Account.update({
          name: Math.random().toString()
        }, {
          where: {
            id: account.get('id')
          }
        });
      });
    });


    if (_.get(current.dialect.supports, 'returnValues.returning')) {
      it('should return the updated record', function () {
        return Account.create({
          ownerId: 2
        }).then(function (account) {
          return Account.update({
            name: 'FooBar'
          }, {
            where: {
              id: account.get('id')
            },
            returning: true
          }).spread(function(count, accounts) {
            var account = accounts[0];
            expect(account.ownerId).to.be.equal(2);
            expect(account.name).to.be.equal('FooBar');
          });
        });
      });
    }

    if (current.dialect.supports['LIMIT ON UPDATE']) {
      it('Should only update one row', function () {
        return Account.create({
          ownerId: 2,
          name: 'Account Name 1'
        })
        .then(() => {
          return Account.create({
            ownerId: 2,
            name: 'Account Name 2'
          });
        })
        .then(() => {
          return Account.create({
            ownerId: 2,
            name: 'Account Name 3'
          });
        })
        .then(() => {
          const options = {
            where: {
              ownerId: 2
            },
            limit: 1
          };
          return Account.update({ name: 'New Name' }, options);
        })
        .then(account => {
          expect(account[0]).to.equal(1);
        });
      });
    }

  });
});
