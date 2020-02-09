const path = require('path');
const fs = require('fs');

module.exports = function Banker(mod) {
  const BANK_CONTRACT = 26;
  const BANK_TYPE = 1;
  const BANK_PAGE_SLOTS = 72;
  const ERROR = '#ff0000';

  let bankInventory;
  let currentContract;
  let onNextOffset;

  //started or closed contract (window)
  mod.hook('S_REQUEST_CONTRACT', 1, event => {
    if (mod.game.me.is(event.senderId)) {
      currentContract = event.type;
    }
  });
  mod.hook('S_CANCEL_CONTRACT', 1, event => {
    if (mod.game.me.is(event.senderId)) {
      currentContract = null;
    }
  });

  mod.hook('S_VIEW_WARE_EX', 1, event => {
    if (!mod.game.me.is(event.gameId))
        return;
    
    if (event.type == BANK_TYPE) {
      mod.log('bank updated');
      currentContract = BANK_CONTRACT;
      bankInventory = event;
      if (onNextOffset) onNextOffset(event);
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

  mod.hook('C_VIEW_WARE', 2, event => {
    mod.log('view');
    mod.log(event);
  });
  mod.hook('C_VIEW_WARE', 2, {filter:{fake: true}}, event => {
    mod.log('view fake');
    mod.log(event);
  });   

  //exlude items by deposit
  //exlude items by id

  mod.command.add('bank', {
    $default() {
    },
    human() {
      mod.settings.human = !mod.settings.human;w
      mod.saveSettings();
      msg('Human mode ' + (mod.settings.human ? 'enabled' : 'disabled'));
    },
    tab() {
      //force deposit tab
      autoDeposit(false);
    },
    all() {
      //force deposit all
      autoDeposit(true);
    },
    mode() {
      //force deposit tab
      mod.settings.tab = !mod.settings.tab;
      mod.saveSettings();
      msg('Single tab mode ' + (mod.settings.tab ? 'enabled' : 'disabled'));
    },
    $none() {
      if (currentContract != BANK_CONTRACT) {
        msg('Bank must be open to use banker module', ERROR);
        return;
      }

      autoDeposit(!mod.settings.tab);
    }
  });

  function autoDeposit(allTabs) {
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
          if (currentContract != BANK_CONTRACT)
            return;
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

      if (allTabs) {
        let next = getNextOffset(bankInventory);
        if (next != undefined) {
          changeBankOffset(next, () => autoDeposit(allTabs));
        }
      }
    }

    depositNext();
  }

  function depositItem(bagItem, offset) {
    mod.send('C_PUT_WARE_ITEM', 3, {
      gameId: mod.game.me.gameId,
      type: BANK_TYPE,
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

  function getNextOffset(bank) {
    mod.log(bank.slots);
    mod.log(bank.offset);
    mod.log(bank.offset + BANK_PAGE_SLOTS);
    if (bank.offset + BANK_PAGE_SLOTS < bank.slots)
      return bank.offset + BANK_PAGE_SLOTS;
  }

  function changeBankOffset(offset, callback) {
    let bankLoaded;
    onNextOffset = event => {
      bankLoaded = true;
      onNextOffset = false;
      callback(event);
    };
    
    setTimeout(() => {
      if (!bankLoaded)
        msg('Failed to load next bank page.');
    }, 1000);

    setTimeout(() => {
      mod.send('C_VIEW_WARE', 2, {
        gameId: mod.game.me.gameId,
        type: BANK_TYPE,
        offset: offset
      });
    }, getRandomDelay());
  }

  function getRandomDelay() {
    return 100 + Math.floor(Math.random() * 100);
  }

  function msg(text, color) {
    if (color !== undefined)
      mod.command.message(`<font color="${color}"> ${text}</font>`);
    else
      mod.command.message(` ${text}`); 
  }
};