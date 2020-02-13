## Banker
Depositing items made easier.

Banker removes the tedium of depositing commonly aquired items.
It works by depositing all inventory items that are already in you bank.

## Usage
All commands should by typed into the tera-toolbox channel `/8` or prefixed with a `!`  
Ex. `\8 bank` or `!bank`

Basic Usage:  
Open personal bank.  
Type `bank` to deposit all matching items in your inventory to the bank.
Items on the blacklist will not be deposited

| Command  | Short Form | Description
| ------------- | ---- | ------------- |
| bank | | Deposits matching items to bank. (Default mode is all tabs) |
| bank mode | | Toggles the default deposit mode. Modes are all tabs or single tab (Default is all tabs) |
| bank tab | | Deposits matching items to bank in current tab only. |
| bank all | | Deposits matching items to bank in all tabs. |
| bank human | | Toggle human-like delays when depositing (Default is off) |
| bank blacklist mode | bank bl mode | Toggle blacklist mode. See below for blacklist mode usage |
| bank blacklist add | bank bl a | Add the next item banked or retrieved to the blacklist |
| bank blacklist add `id` | bank bl a `id` | Add the item id to the blacklist |
| bank blacklist remove | bank bl r | Remove the next item banked or retrieved from the blacklist |
| bank blacklist remove `id` | bank bl r `id` | Remove the item id from the blacklist |
| bank blacklist clear | bank bl clear | Clear the blacklist |

### Blacklist Mode
Blacklist mode allows for adding or removal of items to/from the backlist withought knowing their ids.
In blacklist mode:  
- All items retrieved from the bank will be added to the blacklist.
- All items stored in the bank will be removed from the blacklist.
