const path = require('path');
const fs = require('fs');

module.exports = function Banker(mod) {
  const BANK_CONTRACT = 26;
  const BANK_CONTIANER_TYPE = 1;
  const ERROR = '#ff0000';

  let bankInventory;
  let currentContract;

  //started or closed contract (window)
  mod.hook('S_REQUEST_CONTRACT', 1, event => {
    if (mod.game.me.is(event.senderId)) {
      currentContract = event.type;
    }
  });
  mod.hook('S_CANCEL_CONTRACT', 1, event => {
    if (mod.game.me.gameId == event.senderId) {
      currentContract = null;
    }
  });

  mod.hook('S_VIEW_WARE_EX', 1, event => {
    if (!mod.game.me.is(event.gameId))
        return;
    
    if (event.type == BANK_CONTIANER_TYPE) {
      mod.log('bank updated');
      currentContract = BANK_CONTRACT;
      bankInventory = event;
    }
  });

  let lastevent;
  mod.hook('C_GET_WARE_ITEM', 3, event => {
    mod.log('get: ' + lastevent === undefined? '':(new Date() - lastevent));
    lastevent = new Date();
    //mod.log(event);
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

      mod.log('contract: ' + currentContract);
      autoDeposit();
    }
  });

  function autoDeposit() {
    let bagItems = mod.game.inventory.bagItems.slice(0);
    let bankItems = bankInventory.items.slice(0);

    bagItems.sort((a, b) => a.id - b.id);
    bankItems.sort((a, b) => a.id - b.id);
    let aIdx = 0;
    let bIdx = 0;

    let depositNext = function () {
      //iterate both lists and find matching items to deposit
      while (aIdx < bagItems.length && bIdx < bankItems.length) {
        if (bagItems[aIdx].id === bankItems[bIdx].id) {
          depositItem(bagItems[aIdx], bankInventory.offset);
  
          aIdx++;
          bIdx++;

          setTimeout(() => {
            depositNext();
          }, getRandomDelay());
          return;
        } else if (bagItems[aIdx].id < bankItems[bIdx].id) {
          aIdx++;
        } else {
          bIdx++;
        }
      }
    }

    depositNext();
  }

  function depositItem(bagItem, offset) {
    mod.send('C_PUT_WARE_ITEM', 3, {
      gameId: mod.game.me.gameId,
      type: 1,
      page: offset,
      money: 0,
      pocket: 0,
      pocket: bagItem.pocket,
      invenPos: bagItem.slot,
      id: bagItem.id,
      dbid: bagItem.dbid,
      amount: bagItem.amount,
      bankPos: offset
    });
  }

  function getRandomDelay() {
    return 200 + Math.floor(Math.random() * 200);
  }

  function msg(text, color) {
    if (color !== undefined)
      mod.command.message(`<font color="${color}"> ${text}</font>`);
    else
      mod.command.message(` ${text}`); 
  }
};