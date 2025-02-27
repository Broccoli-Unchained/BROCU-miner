#include <nan.h>
#include "cpuminer.h"

namespace miner {

  using namespace Nan;

  ::CpuMiner* cpuminer = nullptr;

  // Call C++ destructors
  void cleanup(void* p) {
    delete reinterpret_cast<CpuMiner*>(p);
  }

  class Miner : public AsyncWorker {
    public:
      Miner(Callback *callback)
        : AsyncWorker(callback)
      { }

      ~Miner() {}

      // This function runs in a thread spawned by NAN
      void Execute () {
        if (cpuminer) {
          cpuminer->run(); // blocking call
        } else {
          SetErrorMessage("{error: 'no cpuminer!'}");
        }
      }

    private:
      // Executed when the async work is complete
      // this function will be run inside the main event loop
      // so it is safe to use V8 again
      void HandleOKCallback () {
        HandleScope scope;

        v8::Local<v8::Value> argv[] = {
          Null(),
          New<v8::String>(cpuminer->solution()).ToLocalChecked()
        };

        Nan::Call(callback->GetFunction(), Nan::GetCurrentContext()->Global(), 2, argv);
      }
  };

  // Run an asynchronous function
  NAN_METHOD(run) {
    Callback *callback = new Callback(To<v8::Function>(info[0]).ToLocalChecked());
    AsyncQueueWorker(new Miner(callback));
  }

  NAN_METHOD(stop) {
    cpuminer->stop();
    info.GetReturnValue().SetUndefined();
  }

  NAN_METHOD(setChallengeNumber) {
    MaybeLocal<v8::String> inp = Nan::To<v8::String>(info[0]);
    if (!inp.IsEmpty()) {
      cpuminer->setChallengeNumber(std::string(*Nan::Utf8String(inp.ToLocalChecked())));
    }
    info.GetReturnValue().SetUndefined();
  }

  NAN_METHOD(setDifficultyTarget) {
    MaybeLocal<v8::String> inp = Nan::To<v8::String>(info[0]);
    if (!inp.IsEmpty()) {
      cpuminer->setDifficultyTarget(std::string(*Nan::Utf8String(inp.ToLocalChecked())));
    }
    info.GetReturnValue().SetUndefined();
  }

  NAN_METHOD(setMinerAddress) {
    MaybeLocal<v8::String> inp = Nan::To<v8::String>(info[0]);
    if (!inp.IsEmpty()) {
      cpuminer->setMinerAddress(std::string(*Nan::Utf8String(inp.ToLocalChecked())));
    }
    info.GetReturnValue().SetUndefined();
  }

  NAN_METHOD(hashes) {
    uint32_t const value = Solver::hashes;
    Solver::hashes = 0;
    info.GetReturnValue().Set(value);
  }

  // Defines the functions our add-on will export
  NAN_MODULE_INIT(Init) {
    v8::Local<v8::Context> context = target->GetCreationContext().ToLocalChecked();


    Set(target
      , New<v8::String>("run").ToLocalChecked()
      , New<v8::FunctionTemplate>(run)->GetFunction(context).ToLocalChecked());

    Set(target
      , New<v8::String>("stop").ToLocalChecked()
      , New<v8::FunctionTemplate>(stop)->GetFunction(context).ToLocalChecked());

    Set(target
      , New<v8::String>("setChallengeNumber").ToLocalChecked()
      , New<v8::FunctionTemplate>(setChallengeNumber)->GetFunction(context).ToLocalChecked()
    );

    Set(target
      , New<v8::String>("setDifficultyTarget").ToLocalChecked()
      , New<v8::FunctionTemplate>(setDifficultyTarget)->GetFunction(context).ToLocalChecked()
    );

    Set(target
      , New<v8::String>("setMinerAddress").ToLocalChecked()
      , New<v8::FunctionTemplate>(setMinerAddress)->GetFunction(context).ToLocalChecked()
    );

    Set(target
      , New<v8::String>("hashes").ToLocalChecked()
      , New<v8::FunctionTemplate>(hashes)->GetFunction(context).ToLocalChecked()
    );

    
    cpuminer = new CpuMiner;

    // Obtain the current environment and pass it to AtExit
    node::Environment* env = node::GetCurrentEnvironment(context);
    if (env != nullptr) {
      node::AtExit(env, cleanup, cpuminer);
    } else {
      // Handle the case where env is null, though it shouldn't happen here
      fprintf(stderr, "Error: Environment is null\n");
    }
  }

  NODE_MODULE(cpumining, Init)

}
