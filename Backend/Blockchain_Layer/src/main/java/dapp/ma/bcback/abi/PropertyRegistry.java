package dapp.ma.bcback.abi;

import org.web3j.abi.EventEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.*;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.abi.datatypes.generated.Uint128;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.generated.Uint8;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.RemoteFunctionCall;
import org.web3j.protocol.core.methods.response.BaseEventResponse;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tuples.generated.Tuple6;
import org.web3j.tx.Contract;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.Callable;

public class PropertyRegistry extends Contract {
    public static final String BINARY = "Bin Not Needed";

    public static final String FUNC_GETPROPERTY = "getProperty";
    public static final String FUNC_ADDPROPERTY = "addProperty";

    public static final Event PROPERTYADDED_EVENT = new Event("PropertyAdded", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>(true) {}, new TypeReference<Address>(true) {}));

    protected PropertyRegistry(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider gasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, gasProvider);
    }

    public static PropertyRegistry load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider gasProvider) {
        return new PropertyRegistry(contractAddress, web3j, transactionManager, gasProvider);
    }

    public io.reactivex.Flowable<PropertyAddedEventResponse> propertyAddedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        org.web3j.protocol.core.methods.request.EthFilter filter = new org.web3j.protocol.core.methods.request.EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(PROPERTYADDED_EVENT));
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, PropertyAddedEventResponse>() {
            @Override
            public PropertyAddedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(PROPERTYADDED_EVENT, log);
                PropertyAddedEventResponse typedResponse = new PropertyAddedEventResponse();
                typedResponse.log = log;
                typedResponse.propertyId = (BigInteger) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.owner = (String) eventValues.getIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public RemoteFunctionCall<Tuple6<String, BigInteger, BigInteger, BigInteger, byte[], BigInteger>> getProperty(BigInteger propertyId) {
        final Function function = new Function(FUNC_GETPROPERTY, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(propertyId)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}, new TypeReference<Uint128>() {}, new TypeReference<Uint128>() {}, new TypeReference<Uint8>() {}, new TypeReference<Bytes32>() {}, new TypeReference<Uint256>() {}));
        return new RemoteFunctionCall<Tuple6<String, BigInteger, BigInteger, BigInteger, byte[], BigInteger>>(function,
                new Callable<Tuple6<String, BigInteger, BigInteger, BigInteger, byte[], BigInteger>>() {
                    @Override
                    public Tuple6<String, BigInteger, BigInteger, BigInteger, byte[], BigInteger> call() throws Exception {
                        List<Type> results = executeCallMultipleValueReturn(function);
                        return new Tuple6<String, BigInteger, BigInteger, BigInteger, byte[], BigInteger>(
                                (String) results.get(0).getValue(), 
                                (BigInteger) results.get(1).getValue(), 
                                (BigInteger) results.get(2).getValue(), 
                                (BigInteger) results.get(3).getValue(), 
                                (byte[]) results.get(4).getValue(), 
                                (BigInteger) results.get(5).getValue());
                    }
                });
    }

    public static class PropertyAddedEventResponse extends BaseEventResponse {
        public BigInteger propertyId;
        public String owner;
    }
}
