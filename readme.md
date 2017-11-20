
# 1. requirement 

1. get out sdk

# 2. setup 

### import out sdk 

```javascript 
import AZStack from '../../common/azstack/';
```

### config 

```javascript 
const azstack = new AZStack();
azstack.config({
    logLevel: azstack.logLevelConstants.LOG_LEVEL_NONE
});
```

> #### logLevel: can be
> - NONE: no log
> - ERROR: just when error occur
> - INFO: log the error and info of porocess running
> - DEBUG: log the error, infor and data send/receiced