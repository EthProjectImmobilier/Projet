package dapp.ma.bcback.abi;

import org.web3j.abi.EventEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.methods.response.BaseEventResponse;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.Contract;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * <p>Auto generated role-playing wrapper for the Escrow contract.</p>
 */
public class Escrow extends Contract {
    public static final String BINARY = "Bin Not Needed";

    public static final String FUNC_DEPOSIT = "deposit";
    public static final String FUNC_RELEASEFUNDS = "releaseFunds";
    public static final String FUNC_BOOKINGBALANCES = "bookingBalances";

    public static final Event DEPOSITMADE_EVENT = new Event("DepositMade", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>(true) {}, new TypeReference<Uint256>() {}));

    public static final Event FUNDSRELEASED_EVENT = new Event("FundsReleased", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>(true) {}, new TypeReference<Address>(true) {}, new TypeReference<Uint256>() {}));

    protected Escrow(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider gasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, gasProvider);
    }

    public static Escrow load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider gasProvider) {
        return new Escrow(contractAddress, web3j, transactionManager, gasProvider);
    }

    public List<DepositMadeEventResponse> getDepositMadeEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(DEPOSITMADE_EVENT, transactionReceipt);
        ArrayList<DepositMadeEventResponse> responses = new ArrayList<DepositMadeEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            DepositMadeEventResponse typedResponse = new DepositMadeEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.bookingId = (BigInteger) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.amount = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public io.reactivex.Flowable<DepositMadeEventResponse> depositMadeEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        org.web3j.protocol.core.methods.request.EthFilter filter = new org.web3j.protocol.core.methods.request.EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(DEPOSITMADE_EVENT));
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, DepositMadeEventResponse>() {
            @Override
            public DepositMadeEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(DEPOSITMADE_EVENT, log);
                DepositMadeEventResponse typedResponse = new DepositMadeEventResponse();
                typedResponse.log = log;
                typedResponse.bookingId = (BigInteger) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.amount = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }

    public List<FundsReleasedEventResponse> getFundsReleasedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(FUNDSRELEASED_EVENT, transactionReceipt);
        ArrayList<FundsReleasedEventResponse> responses = new ArrayList<FundsReleasedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            FundsReleasedEventResponse typedResponse = new FundsReleasedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.bookingId = (BigInteger) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.to = (String) eventValues.getIndexedValues().get(1).getValue();
            typedResponse.amount = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public io.reactivex.Flowable<FundsReleasedEventResponse> fundsReleasedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        org.web3j.protocol.core.methods.request.EthFilter filter = new org.web3j.protocol.core.methods.request.EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(FUNDSRELEASED_EVENT));
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, FundsReleasedEventResponse>() {
            @Override
            public FundsReleasedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(FUNDSRELEASED_EVENT, log);
                FundsReleasedEventResponse typedResponse = new FundsReleasedEventResponse();
                typedResponse.log = log;
                typedResponse.bookingId = (BigInteger) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.to = (String) eventValues.getIndexedValues().get(1).getValue();
                typedResponse.amount = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }
    
    public org.web3j.protocol.core.RemoteFunctionCall<TransactionReceipt> releaseFunds(BigInteger bookingId, String to, BigInteger amount) {
        final Function function = new Function(
                FUNC_RELEASEFUNDS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(bookingId), 
                        new org.web3j.abi.datatypes.Address(to), 
                        new org.web3j.abi.datatypes.generated.Uint256(amount)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public org.web3j.protocol.core.RemoteFunctionCall<TransactionReceipt> deposit(BigInteger bookingId, String owner, BigInteger value) {
        final Function function = new Function(
                FUNC_DEPOSIT, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(bookingId), 
                        new org.web3j.abi.datatypes.Address(owner)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function, value);
    }

    public org.web3j.protocol.core.RemoteFunctionCall<BigInteger> bookingBalances(BigInteger param0) {
        final Function function = new Function(FUNC_BOOKINGBALANCES, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(param0)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    public static class DepositMadeEventResponse extends BaseEventResponse {
        public BigInteger bookingId;
        public BigInteger amount;
    }

    public static class FundsReleasedEventResponse extends BaseEventResponse {
        public BigInteger bookingId;
        public String to;
        public BigInteger amount;
    }
}
