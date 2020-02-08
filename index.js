const path = require('path');
const fs = require('fs');

module.exports = function Banker(mod) {
  const BANK_CONTRACT = 26;
  const ERROR = '#ff0000';

  let messageHook;

  //started or closed contract (window)
  mod.hook('S_REQUEST_CONTRACT', 1, event => {
    if (mod.game.me.gameId == event.senderId) {
      currentContract = event.type;
    }
  });
  mod.hook('S_CANCEL_CONTRACT', 1, event => {
    if (mod.game.me.gameId == event.senderId) {
      currentContract = null;
    }
  });

  mod.hook('C_GET_WARE_ITEM', 3, event => {
    mod.log('get');
    mod.log(event);
  });
  mod.hook('C_GET_WARE_ITEM', 3, {filter:{fake: true}}, event => {
    mod.log('get fake');
    mod.log(event);
  });
  mod.hook('C_PUT_WARE_ITEM', 3, event => {
    mod.log('put');
    mod.log(event);
  });
  mod.hook('C_PUT_WARE_ITEM', 3, {filter:{fake: true}}, event => {
    mod.log('put fake');
    mod.log(event);
  });

  mod.command.add('bank', {
    $default() {
    },
    $none() {
      if (currentContract != BANK_CONTRACT) {
        msg('Bank must be open to use banker module', ERROR);
        return;
      }

      autoDeposit();
    }
  });

  function autoDeposit() {
    let bagItems = mod.game.inventory.bagItems;

    let item = bagItems[0];
    mod.log(item);

    mod.send('C_PUT_WARE_ITEM', 3, {
      gameId: mod.game.me.gameId,
      type: 1,
      page: 0,
      pocket: item.pocket,
      invenPos: item.slot,
      id: item.id,
      dbid: item.dbid,
      amount: 1
    });
  }

  function msg(text, color) {
    if (color !== undefined)
      mod.command.message(`<font color="${color}"> ${text}</font>`);
    else
      mod.command.message(` ${text}`); 
  }
};