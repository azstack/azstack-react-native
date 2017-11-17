
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
    logLevel: 'DEBUG'
});
```

> #### logLevel: can be
> 1. NONE: no log
> 2. ERROR: just when error occur
> 3. INFO: log the error and info of porocess running
> 4. DEBUG: log the error, infor and data send/receiced